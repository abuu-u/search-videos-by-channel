import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { IVideo } from '../../types/video';

type LoadVideosResponse = {
  videos: {
    _id: string;
    preview: {
      template: string;
    };
    title: string;
    url: string;
  }[];
};

type SearchVideoResponse = {
  channels: {
    _id: number;
  }[];
};

const TWITCH_API = 'https://api.twitch.tv/kraken';
const CLIENT_ID = 'ec0g8k5crw9kw1fq818pf6fy2o424d';

const HEADERS = {
  'Content-Type': 'application/json',
};

const TWITCH_HEADERS = {
  ...HEADERS,
  Accept: 'application/vnd.twitchtv.v5+json',
  'Client-ID': CLIENT_ID,
};

const addToFavorites = createAsyncThunk<void, IVideo>(
  'favorites/addToFavorites',
  async (video) => {
    await fetch(`/api/video`, {
      method: 'POST',
      body: JSON.stringify(video),
      headers: HEADERS,
    });
  }
);

const removeFromFavorites = createAsyncThunk<void, string>(
  'favorites/removeFromFavorites',
  async (videoId) => {
    await fetch(`/api/video?videoId=${videoId}`, {
      method: 'DELETE',
    });
  }
);

export const updateFavorites = createAsyncThunk<
  void,
  { videoId: string; isFavorite: boolean },
  { state: VideoState }
>('favorites/updateFavorites', async ({ videoId, isFavorite }, thunkApi) => {
  await (isFavorite
    ? thunkApi.dispatch(
        addToFavorites({
          ...(thunkApi
            .getState()
            .videos.find((video) => video.id === videoId) as IVideo),
          isFavorite,
        })
      )
    : thunkApi.dispatch(removeFromFavorites(videoId)));
});

export const loadFavorites = createAsyncThunk<IVideo[], void>(
  'favorites/loadFavorites',
  async () => {
    const response = await fetch('/api/video');

    return (await response.json()) as IVideo[];
  }
);

export const loadVideos = createAsyncThunk<
  IVideo[],
  string,
  { state: VideoState }
>('videos/loadVideos', async (channelName, thunkApi) => {
  const channelSearchResponse = await fetch(
    `${TWITCH_API}/search/channels?query=${channelName}`,
    {
      method: 'GET',
      headers: TWITCH_HEADERS,
    }
  );

  // eslint-disable-next-line no-underscore-dangle
  const channelId = ((await channelSearchResponse.json()) as SearchVideoResponse)
    .channels[0]._id;

  const response = await fetch(`${TWITCH_API}/channels/${channelId}/videos`, {
    method: 'GET',
    headers: TWITCH_HEADERS,
  });

  await thunkApi.dispatch(loadFavorites());
  const { favorites } = thunkApi.getState();

  return ((await response.json()) as LoadVideosResponse).videos
    .map((videos) => ({
      // eslint-disable-next-line no-underscore-dangle
      id: videos._id,
      src: videos.url,
      poster: videos.preview.template,
      title: videos.title,
      isFavorite: false,
    }))
    .map((video) =>
      favorites.find((favorite) => favorite.id === video.id) === undefined
        ? video
        : { ...video, isFavorite: true }
    );
});

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

type VideoState = {
  videos: IVideo[];
  favorites: IVideo[];
  videosLoading: LoadingState;
  favoritesLoading: LoadingState;
};

const initialState: VideoState = {
  videos: [],
  favorites: [],
  videosLoading: LoadingState.IDLE,
  favoritesLoading: LoadingState.IDLE,
};

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadVideos.pending, (state) => {
      state.videos = [];
      state.videosLoading = LoadingState.LOADING;
    });
    builder.addCase(loadVideos.fulfilled, (state, action) => {
      state.videos = action.payload;
      state.videosLoading = LoadingState.LOADED;
    });
    builder.addCase(loadVideos.rejected, (state) => {
      state.videosLoading = LoadingState.ERROR;
    });

    builder.addCase(loadFavorites.pending, (state) => {
      state.favorites = [];
      state.favoritesLoading = LoadingState.LOADING;
    });
    builder.addCase(loadFavorites.fulfilled, (state, action) => {
      state.favorites = action.payload;
      state.favoritesLoading = LoadingState.LOADED;
    });
    builder.addCase(loadFavorites.rejected, (state) => {
      state.favoritesLoading = LoadingState.ERROR;
    });

    builder.addCase(addToFavorites.fulfilled, (state, action) => {
      const videos = [...state.videos];

      const videoIndex = videos.findIndex(
        (video) => video.id === action.meta.arg.id
      );

      if (videoIndex !== undefined) {
        state.videos = [
          ...videos.slice(0, videoIndex),
          action.meta.arg,
          ...videos.slice(videoIndex + 1),
        ];
      }

      state.favorites.push(action.meta.arg);
    });

    builder.addCase(removeFromFavorites.fulfilled, (state, action) => {
      const favorites = [...state.favorites];
      const videos = [...state.videos];

      const videoIndex = videos.findIndex(
        (video) => video.id === action.meta.arg
      );

      if (videoIndex !== undefined) {
        state.videos = [
          ...videos.slice(0, videoIndex),
          { ...videos[videoIndex], isFavorite: false },
          ...videos.slice(videoIndex + 1),
        ];
      }

      favorites.splice(
        favorites.findIndex((favorite) => favorite.id === action.meta.arg),
        1
      );
      state.favorites = favorites;
    });
  },
});

export const selectVideos = createSelector(
  (state: VideoState) => ({
    videos: state.videos,
    loading: state.videosLoading,
  }),
  (state) => state
);

export const selectFavorites = createSelector(
  (state: VideoState) => ({
    favorites: state.favorites,
    loading: state.favoritesLoading,
  }),
  (state) => state
);

export default videosSlice.reducer;
