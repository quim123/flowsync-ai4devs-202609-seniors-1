import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: responsable identificable, la tarea no
 * filtra datos de cuenta, y responsable sin nombre.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion(client: any, email = 'lector@example.com') {
    await User.create({ fullName: 'Lector', email, password: 'secreto123' })

    const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  async function tareaDe(fullName: string | null, email: string) {
    const responsable = await User.create({ fullName, email, password: 'secreto123' })

    return Task.create({
      title: 'Escribir el informe',
      status: 'pending',
      assigneeId: responsable.id,
    })
  }

  test('el assignee de una tarea trae el nombre y las iniciales de su responsable', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const response = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: '2026-10-07' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const assignee = response.body().data.assignee
    assert.equal(assignee.fullName, 'Ada Lovelace')
    assert.equal(assignee.initials, 'AL')
  })

  test('el assignee no incluye el email ni datos de acceso, ni en la tarea suelta ni en la lista', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const suelta = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: '2026-10-07' })
      .header('Authorization', `Bearer ${token}`)

    suelta.assertStatus(200)

    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    lista.assertStatus(200)

    const enLista = lista.body().data.find((t: any) => t.id === tarea.id)
    assert.exists(enLista, 'la tarea debería aparecer en la lista')

    for (const assignee of [suelta.body().data.assignee, enLista.assignee]) {
      assert.notProperty(assignee, 'email')
      assert.notProperty(assignee, 'password')
      assert.notInclude(JSON.stringify(assignee), 'ada@example.com')
    }
  })

  test('un responsable sin nombre llega con nombre nulo y con iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe(null, 'sinnombre@example.com')

    const response = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: '2026-10-07' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const assignee = response.body().data.assignee
    assert.isNull(assignee.fullName)
    assert.isString(assignee.initials)
    assert.isAbove(assignee.initials.length, 0)
  })
})
