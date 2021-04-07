import { useSelector } from 'react-redux';
import Layout from '../components/layout';
import { selectVideos } from '../lib/slices/video-slice';

const Home = (): JSX.Element => {
  const { videos, loading } = useSelector(selectVideos);

  return <Layout videos={videos} loading={loading} />;
};

export default Home;
