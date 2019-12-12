
const FoldersService = {
  getAllFolders(knex) {
    return knex
    .select('*')
    .from('noteful_folders')
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into('noteful_folders')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, folderid) {
    return knex.from('noteful_folders').select('*').where('folderid', folderid).first()
  },
  
}

module.exports = FoldersService;