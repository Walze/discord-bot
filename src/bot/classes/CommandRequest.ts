import { ITextParams } from './Requirements';
import { log } from 'console'
import { Message } from "discord.js"
import { IIndexObj } from '../helpers/obj_array'
import { Iat } from "../../types"
import Commands from "./Commands"
import { globalMatch } from '../helpers/globalMatch';

// s-debug argument-value
// Eg. s-debug event=MEMBER_ADD_BAN amount=5 @wiva#9996
// params.argument will equals to value

export interface ICommandInfoType {
  name: string | null,
  hasPrefix: boolean
}

export interface IPropsType {
  command: ICommandInfoType
  params: IIndexObj<ITextParams>
  text: string
  ats: Iat[]
}

/**
 * Creates a command request
 *
 */
export default class CommandRequest {

  public command: string | null = null
  public text: string | null = null
  public params: IIndexObj<ITextParams> = {}
  public hasPrefix: boolean = false

  private _ats: Iat[] = []

  private readonly _commandRegex = new RegExp(`^${Commands.prefix}(\\w+)`)
  private readonly _paramsRegex = /--([^\s=]+)[\s=]([^\s]+)/g
  private readonly _atsRegex = /<@(&?)!?(\d+)>/g

  /**
   * Gets and sets props
   */
  constructor(public readonly msg: Message) {
    const props = this._filterProps()
    if (!props || !props.command.name) return

    this._setProperties(props)
  }

  /**
   * !!!! USE METHODS GET ATS, ONLY USE THIS FOR MAPS !!!!
   */
  public get ats() {
    console.warn('!!!! USE METHODS GET ATS, ONLY USE THIS FOR MAPS !!!!')

    return [...this._ats]
  }

  public get atsLength() {
    return this._ats.length
  }

  /**
   * Throws if not found
   */
  public at(pos: number): Iat {
    const found = this._ats.find((item, i) => i === pos && item.type === 'USER')
    if (!found) throw new Error('@ expected but haven\'t got any')

    return found
  }

  /**
   * Throws if not found
   */
  public roleAt(pos: number): Iat {
    const found = this._ats.find((item, i) => i === pos && item.type === 'ROLE')
    if (!found) throw new Error('Role @ expected but haven\'t got any')

    return found
  }

  /**
   * Logs Request instance
   *
   * @param [logBool] Logs to console if true
   * @param args Additional logs
   * @returns Copy of Request
   */
  public log(logBool?: boolean, ...args: any[]): object {
    const filtered: any = {}

    for (const prop in this)
      if (prop !== 'msg')
        filtered[prop] = this[prop]

    if (logBool)
      log(filtered, ...args)

    return filtered
  }

  /**
   * Sets all props of this
   */
  private _setProperties(props: IPropsType) {
    this.command = props.command.name
    this.hasPrefix = props.command.hasPrefix
    this.params = props.params
    this.text = props.text
    this._ats = props.ats
  }

  /**
   * Gets props
   */
  private _filterProps(): IPropsType | void {
    const { content: msg } = this.msg

    const commandRegex = msg.match(this._commandRegex)
    const command: ICommandInfoType = { name: null, hasPrefix: false }

    if (commandRegex) {
      command.name = commandRegex[1]
      command.hasPrefix = true
    } else {
      // if no regex, tries to find non-prefix command
      command.name = this._getNonPrefixCommand()

      // if no non-prefix command found, returns
      if (!command.name) return
    }

    const params = this._getParams(msg)
    const ats: Iat[] = this._getAts(msg)

    const text = this._getText(msg)

    return { ats, command, params, text }
  }

  private _getText(msg: string) {
    return msg
      .replace(this._atsRegex, '')
      .replace(this._commandRegex, '')
      .replace(this._paramsRegex, '')
      .trim()
  }

  /**
   * Searches on commands if the text contains any commands that doesn't require prefix
   */
  private _getNonPrefixCommand() {
    const command = Commands.includesCommand(this.msg.content)

    if (!command) return null
    if (command.required.prefix) return null

    return command.name
  }

  private _getParams(msg: string) {
    const params: IIndexObj<ITextParams> = {}
    const paramsMatches = globalMatch(this._paramsRegex, msg)

    if (paramsMatches)
      paramsMatches.map(match => params[match[1]] = match[2])

    return params
  }

  private _getAts(msg: string) {
    const atsMatches = globalMatch(this._atsRegex, msg) || []

    const ats: Iat[] = atsMatches.map(match => {
      const { 0: tag, 1: roleFlag, 2: id } = match

      const type: 'ROLE' | 'USER' = roleFlag
        ? 'ROLE'
        : 'USER'

      return { id, tag, type }
    })

    return ats
  }

}
