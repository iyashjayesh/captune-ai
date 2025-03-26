import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

function getFileExtension(file_name: string) {
    const regex = /(?:\.([^.]+))?$/; // Matches the last dot and everything after it
    const match = regex.exec(file_name);
    if (match && match[1]) {
        return match[1];
    }
    return ''; // No file extension found
}

function removeFileExtension(file_name: string) {
    const lastDotIndex = file_name.lastIndexOf('.');
    if (lastDotIndex !== -1) {
        return file_name.slice(0, lastDotIndex);
    }
    return file_name; // No file extension found
}

export async function convertFile(
    ffmpeg: FFmpeg,
    action: { file: File; to: string; file_name: string; file_type: string }
): Promise<{ url: string; output: string }> {
    const { file, to, file_name, file_type } = action;
    const input = getFileExtension(file_name);
    const output = removeFileExtension(file_name) + '.' + to;
    ffmpeg.writeFile(input, await fetchFile(file));

    // FFMEG COMMANDS
    let ffmpeg_cmd: string[] = [];

    // 3gp video
    if (to === '3gp')
        ffmpeg_cmd = [
            '-i',
            input,
            '-r',
            '20',
            '-s',
            '352x288',
            '-vb',
            '400k',
            '-acodec',
            'aac',
            '-strict',
            'experimental',
            '-ac',
            '1',
            '-ar',
            '8000',
            '-ab',
            '24k',
            output,
        ];
    else ffmpeg_cmd = ['-i', input, output];

    // execute cmd
    await ffmpeg.exec(ffmpeg_cmd);

    const data = await ffmpeg.readFile(output) as Uint8Array;
    const blob = new Blob([data], { type: file_type.split('/')[0] });
    const url = URL.createObjectURL(blob);
    return { url, output };
}

export async function embedSubtitles(ffmpeg: FFmpeg, videoFile: File, srtContent: string) {
    // Write input files to FFmpeg's virtual filesystem
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
    await ffmpeg.writeFile('subtitles.srt', srtContent);

    // FFmpeg command to burn subtitles into video
    const ffmpeg_cmd = [
        '-i',
        'input.mp4',
        '-vf',
        'subtitles=subtitles.srt:force_style=\'FontSize=24,FontName=Arial\'',
        '-c:a',
        'copy',
        'output.mp4'
    ];

    // Execute FFmpeg command
    await ffmpeg.exec(ffmpeg_cmd);

    // Read the processed file              
    const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
    const blob = new Blob([data], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    return { url, output: 'output.mp4' };
}