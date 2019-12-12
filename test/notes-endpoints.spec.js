const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray } = require('./folders.fixtures')
const { makeNotesArray } = require('./notes.fixtures')

describe('Notes Endpoints', function() {
  let db

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)

  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

  describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    })

    context('Given there are folders in the database', () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('noteful_notes')
              .insert(testNotes)
          })
      })

      it('responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes)
      })
    })

  }) 
  describe(`GET /api/notes/:noteId`, () => {
    context(`Given no note`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456
        return supertest(app)
          .get(`/api/note/${noteId}`)
          .expect(404, { error: { message: `Note doesn't exist` } })
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('noteful_notes')
              .insert(testNotes)
          })
      })

      it('responds with 200 and the specified note', () => {
        const noteId = 2
        const expectedNote = testNotes[noteId - 1]
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, expectedNote)
      })
    })
  })

//   describe(`POST /api/folders`, () => {
//     const testNotes = makeNotesArray();
//     beforeEach('insert malicious article', () => {
//       return db
//         .into('noteful_notes')
//         .insert(testNotes)
//     })

//     it(`creates a folder, responding with 201 and the new folder`, () => {
//       const newFolder= {
//         foldername: 'Test Folder Name'
//       }
//       return supertest(app)
//         .post('/api/folders')
//         .send(newFolder)
//         .expect(201)
//         .expect(res => {
//           expect(res.body.foldername).to.eql(newArticle.foldername)
//           expect(res.body).to.have.property('id')
//           expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
//           expect(actual).to.eql(expected)
//         })
//         .then(res =>
//           supertest(app)
//             .get(`/api/folders/${res.body.id}`)
//             .expect(res.body)
//         )
//     })

//     const requiredFields = ['foldername']

//     requiredFields.forEach(field => {
//       const newFolder = {
//         foldername: 'Test Folder Name'

//       }

//       it(`responds with 400 and an error message when the '${field}' is missing`, () => {
//         delete newFolder[field]

//         return supertest(app)
//           .post('/api/folders')
//           .send(newFolder)
//           .expect(400, {
//             error: { message: `Missing '${field}' in request body` }
//           })
//       })
//     })

    
//   })

  describe(`DELETE /api/notes/:noteId`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456
        return supertest(app)
          .delete(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `Note doesn't exist` } })
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('noteful_notes')
              .insert(testNotes)
          })
      })

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2
        const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/notes`)
              .expect(expectedNotes)
          )
      })
    })
  })

//   describe(`PATCH /api/folders/:folder_id`, () => {
//     context(`Given no folders`, () => {
//       it(`responds with 404`, () => {
//         const folderId = 123456
//         return supertest(app)
//           .delete(`/api/folders/${folderId}`)
//           .expect(404, { error: { message: `Folder doesn't exist` } })
//       })
//     })

//     context('Given there are folders in the database', () => {
//       const testNotes = makeNotesArray();
//       const testFolders = makeFoldersArray()

//       beforeEach('insert folders', () => {
//         return db
//           .into('noteful_notes')
//           .insert(testNotes)
//           .then(() => {
//             return db
//               .into('noteful_folder')
//               .insert(testFolders)
//           })
//       })

//       it('responds with 204 and updates the folder', () => {
//         const idToUpdate = 2
//         const updateFolder = {
//           foldername: 'updated foldername ',
//         }
//         const expectedFolder = {
//           ...testFolders[idToUpdate - 1],
//           ...updateFolder
//         }
//         return supertest(app)
//           .patch(`/api/folders/${idToUpdate}`)
//           .send(updateFolder)
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/api/folders/${idToUpdate}`)
//               .expect(expectedFolder)
//           )
//       })

//       it(`responds with 400 when no required fields supplied`, () => {
//         const idToUpdate = 2
//         return supertest(app)
//           .patch(`/api/folders/${idToUpdate}`)
//           .send({ irrelevantField: 'foo' })
//           .expect(400, {
//             error: {
//               message: `Request body must contain 'name'`
//             }
//           })
      })

      // it(`responds with 204 when updating only a subset of fields`, () => {
      //   const idToUpdate = 2
      //   const updateFolder = {
      //     foldername: 'updated foldername ',
      //   }
      //   const expectedArticle = {
      //     ...testArticles[idToUpdate - 1],
      //     ...updateArticle
      //   }

      //   return supertest(app)
      //     .patch(`/api/articles/${idToUpdate}`)
      //     .send({
      //       ...updateArticle,
      //       fieldToIgnore: 'should not be in GET response'
      //     })
      //     .expect(204)
      //     .then(res =>
      //       supertest(app)
      //         .get(`/api/articles/${idToUpdate}`)
      //         .expect(expectedArticle)
      //     )
//       // })
//     })
//   })
// })