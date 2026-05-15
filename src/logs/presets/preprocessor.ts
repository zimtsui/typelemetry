import { formatWithOptions } from 'node:util';
import { stderr } from 'node:process';
import { chalkStderr } from 'chalk';
import { Tracer } from '../../trace/tracer.ts';
import { levelMap } from './level.ts';
import { Preprocessor as GenericPreprocessor } from '../preprocessor.ts';



export type Preprocessor = GenericPreprocessor<typeof levelMap>;
export const preprocessor: Preprocessor = data => {
    const firstLine: string[] = [];

    const timeString = '[' + new Date().toISOString() + ']';
    firstLine.push(timeString);

    const levelString = !!stderr.isTTY ? (() => {
        if (data.levelNumber >= 17)
            return chalkStderr.bgRed(data.levelText);
        else if (data.levelNumber >= 13)
            return chalkStderr.bgYellow(data.levelText);
        else
            return chalkStderr.bgGray(data.levelText);
    })() : data.levelText;
    firstLine.push(levelString);

    const scopeString = data.scopeName;
    firstLine.push(scopeString);

    const eventString = data.eventName && chalkStderr.bgBlue(data.eventName);
    if (eventString) firstLine.push(eventString);

    stderr.write(firstLine.join(' ') + '\n');

    const spanFrames = Tracer.getSpanFrames();
    if (spanFrames.length)
        stderr.write(
            '> ' +
            spanFrames.map(
                frame => frame.name + ' ' + JSON.stringify(frame.attrs),
            ).join(' > ') + '\n',
        );

    const messageString = formatWithOptions({ depth: null, colors: !!stderr.isTTY }, data.message);
    stderr.write(messageString + '\n');
}
