const path = require('path')
const knex = require('knex')
require('dotenv').config()
const express = require('express')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolders = folder => ({
  folderid: folder.folderid,
  foldername: folder.foldername,

})


foldersRouter
  .route('/')
  .get((req, res, next) => {
    

    const knexInstance = req.app.get('db')
    
    FoldersService.getAllFolders(knexInstance)

      .then(results => {
        res.status(200).json(results)
       
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { foldername } = req.body
    const newFolder = { foldername }
    
    for (const [key, value] of Object.entries(newFolder))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    FoldersService.insertFolder(
      req.app.get('db'),
      newFolder
      
    )
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.folderid}`))
          .json(serializeFolders(folder))
      })
      .catch(next)
  })

foldersRouter
  .route('/:folderid')
  .all((req, res, next) => {
    FoldersService.getById(
      req.app.get('db'),
      req.params.folderid
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeFolders(res.folder))
  })
  

module.exports = foldersRouter