import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/layout';
import { loadFavorites, selectFavorites } from '../lib/slices/video-slice';
import { useAppDispatch } from '../src/store';

const Favorites = (): JSX.Element => {
  const { favorites, loading } = useSelector(selectFavorites);
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function dispatchLoadFavorites() {
      await dispatch(loadFavorites());
    }
    void dispatchLoadFavorites();
  }, [dispatch]);

  return <Layout videos={favorites} loading={loading} />;
};

export default Favorites;
