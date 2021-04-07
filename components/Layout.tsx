/* eslint-disable unicorn/filename-case */
/* eslint-disable styled-components-a11y/anchor-is-valid */
import { useRouter } from 'next/dist/client/router';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { LoadingState, loadVideos } from '../lib/slices/video-slice';
import { useAppDispatch } from '../src/store';
import { IVideo } from '../types/video';
import Error from './error';
import Loading from './loading';
import VideoCard from './video-card';

const Header = styled.header`
  background-color: ${(props) => props.theme.colors.primary};
  padding: 0 100px;
  border-bottom: 1px solid ${(props) => props.theme.colors.secondary};
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const Button = styled.button`
  border: 1px solid ${(props) => props.theme.colors.secondary};
  align-self: stretch;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
  }
`;

const NavItem = styled(Button)`
  border-top: 0;
  border-bottom: 0;
  display: flex;
  align-items: center;
  padding: 0 10px;
  background-color: #fff;
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  flex: 1;
  margin: 0 50px;
  padding: 10px 0;
`;

const SearchInput = styled.input`
  flex: 1;
  margin: 0 10px;
  border: 1px solid ${(props) => props.theme.colors.secondary};
  border-radius: ${(props) => props.theme.borderRadius};
  height: 30px;
`;

const SearchButton = styled(Button)`
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: #fff;
  padding: 0 10px;
`;

const Main = styled.main`
  padding: 20px 100px;
`;

const Section = styled.section`
  display: flex;
  flex-flow: row wrap;
  gap: 20px 2%;
`;

const Layout = ({
  videos,
  loading,
}: {
  videos: IVideo[];
  loading: LoadingState;
}): JSX.Element => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(sectionRef.current!.offsetWidth);
  }, []);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
      </Head>

      <Header>
        <Nav>
          <Link href="/" passHref>
            <NavItem as="a">Главная</NavItem>
          </Link>
          <SearchForm
            onSubmit={async (evt) => {
              evt.preventDefault();
              if (inputRef.current?.value.length) {
                await dispatch(loadVideos(inputRef.current.value));
                await router.push('/');
              }
            }}
          >
            {/* //! FIXME https://github.com/brendanmorrell/eslint-plugin-styled-components-a11y/issues/18 */}
            {/* eslint-disable-next-line jsx-a11y/label-has-for,jsx-a11y/label-has-associated-control */}
            <label htmlFor="search-input">Введите название канала</label>
            <SearchInput
              type="search"
              name="search-input"
              id="search-input"
              ref={inputRef}
            />
            <SearchButton type="submit">Найти</SearchButton>
          </SearchForm>
          <Link href="/favorites" passHref>
            <NavItem as="a">Избранное</NavItem>
          </Link>
        </Nav>
      </Header>

      <Main>
        <Section ref={sectionRef}>
          {loading === LoadingState.LOADING && <Loading />}
          {loading === LoadingState.ERROR && <Error />}
          {loading === LoadingState.LOADED &&
            videos.length > 0 &&
            videos.map(({ isFavorite, poster, src, title, id }) => (
              <VideoCard
                key={id}
                isFavorite={isFavorite}
                poster={poster}
                src={src}
                title={title}
                id={id}
                parentWidth={width}
              />
            ))}
        </Section>
      </Main>
    </div>
  );
};

export default Layout;
