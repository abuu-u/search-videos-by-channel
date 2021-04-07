import { nSQL } from '@nano-sql/core';

const connectMiddleware = (handler) => async (req, res) => {
  const dbName = 'favoritesDB';

  if (!nSQL().listDatabases().includes(dbName)) {
    await nSQL().createDatabase({
      id: dbName,
      mode: 'TEMP',
      tables: [
        {
          name: 'favorites',
          model: {
            'id:string': { pk: true },
            'src:string': { notNull: true },
            'poster:string': { notNull: true },
            'title:string': { notNull: true },
            'isFavorite:boolean': { notNull: true },
          },
        },
      ],
      version: 1,
    });
  }
  nSQL().useDatabase(dbName);

  return handler(req, res);
};

const saveFavorite = async (req, res) => {
  const { id, src, poster, title, isFavorite } = req.body;
  const errors = {};

  if (!id) errors['id'] = 'Id is required';
  if (!src) errors['src'] = 'Src is required';
  if (!poster) errors['poster'] = 'Poster is required';
  if (!title) errors['title'] = 'Title is required';
  if (isFavorite === null) errors['isFavorite'] = 'IsFavorite is required';

  if (Object.keys(errors).length > 0)
    return res.status(422).json({
      statusCode: 422,
      message: 'Unprocessable Entity',
      errors,
    });

  const [favorite] = await nSQL('favorites').query('upsert', { id, src, poster, title, isFavorite }).exec();

  res.status(201).json(favorite);
};
const listFavorites = async (_, res) => {
  const favorites = await nSQL('favorites').query('select').exec();

  res.json(favorites);
};

const removeFavorite = async (req, res) => {
  const { videoId } = req.query;
  const [favorite] = await nSQL()
    .query('select')
    .where(['id', '=', videoId])
    .limit(1)
    .exec();

  if (!favorite)
    return res.status(404).json({
      statusCode: 404,
      message: 'Not Found',
    });

  await nSQL('favorites')
    .query('delete')
    .where(['id', '=', videoId])
    .limit(1)
    .exec();

  res.status(204).send(null);
};

const handler = (req, res) => {
  switch (req.method) {
    case 'POST':
      return saveFavorite(req, res);
    case 'GET':
      return listFavorites(req, res);
    case 'DELETE':
      return removeFavorite(req, res);
    default:
      return res.status(404).json({
        statusCode: 404,
        message: 'Not Found',
      });
  }
};

export default connectMiddleware(handler);
