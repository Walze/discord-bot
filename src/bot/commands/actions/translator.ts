import { Languages } from './helpers/langs'
import * as def from 'google-translate-api'
import { actionBehaviour } from '../../../types';
import { Requirements } from '../../classes/Requirements';
import Action from '../../classes/Action';
import Commands from '../../classes/Commands';

const { default: translate } = def

const requirements: Requirements = {
  text: true,
  params: {
    from: false,
    to: false,
  },
}

const description = 'Translates given text to ~~almost~~ any language ~~precision not guaranteed~~'

const action: actionBehaviour = async request => {

  return await translate(request.text, {
    from: switchText(request.params.from) || 'auto',
    to: switchText(request.params.to),
  }).then((res: Response) => {
    request.msg.channel.send(`${res.text}`)
    return res
  })
}

const translator = new Action(requirements, action, description)
Commands.add('tl', translator)

function switchText(language: string = ''): string | void {
  language = language.replace(/\b\w/g, l => l.toUpperCase())

  for (const lang in Languages)
    if (Languages[lang] === language)
      return Languages[lang]
}
