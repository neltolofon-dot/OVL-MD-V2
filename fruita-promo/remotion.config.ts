import {Config} from '@remotion/cli/config';

// PNG frames keep the encode in standard limited-range yuv420p (JPEG frames
// would produce full-range yuvj420p, which some editors mishandle).
Config.setVideoImageFormat('png');
Config.setCodec('h264');
Config.setCrf(15);
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setX264Preset('slow');
Config.setAudioBitrate('320k');
Config.setTimeoutInMilliseconds(120000);
