import { useRef } from 'react';
import styled from 'styled-components';
import { updateFavorites } from '../lib/slices/video-slice';
import { useAppDispatch } from '../src/store';
import { IVideo } from '../types/video';
import VisuallyHidden from '../utils/mixins';

const VideoWrapper = styled.article`
  width: 32%;
  height: 56.25%;
  position: relative;
  display: flex;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
`;

const VideoTitleWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;

  ${/* sc-selector */ VideoWrapper}:hover & {
    opacity: 1;
  }
`;

const VideoTitle = styled.a`
  font-size: 20px;
  color: white;
  text-align: center;

  &:before {
    position: absolute;
    width: 100%;
    height: 100%;
    content: '';
    top: 0;
    left: 0;
  }
`;

const VideoButton = styled.button<{ isFavorite: boolean }>`
  font-size: 50px;
  z-index: 2;

  color: ${(props) => (props.isFavorite ? 'red' : 'grey')};

  > span {
    ${VisuallyHidden}
  }
`;

const VideoCard = ({
  id,
  src,
  poster,
  title,
  isFavorite,
  parentWidth,
}: IVideo & { parentWidth: number }): JSX.Element => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLElement | null>(null);
  const width = Math.round(parentWidth * 0.32);
  const height = Math.round(width * 0.5625);

  return (
    <VideoWrapper ref={ref}>
      <Video
        poster={poster
          .replace('{width}', width.toString())
          .replace('{height}', height.toString())}
        width={width}
        height={height}
        muted
      />
      <VideoTitleWrapper>
        <VideoTitle href={src}>{title}</VideoTitle>
        <VideoButton
          type="button"
          isFavorite={isFavorite}
          onClick={async () => {
            await dispatch(
              updateFavorites({ videoId: id, isFavorite: !isFavorite })
            );
          }}
        >
          ❤<span>Добавить/удалить из избранного</span>
        </VideoButton>
      </VideoTitleWrapper>
    </VideoWrapper>
  );
};

export default VideoCard;
