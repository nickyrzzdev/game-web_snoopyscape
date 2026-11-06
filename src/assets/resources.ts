import * as ex from 'excalibur'
import { allSpriteImages } from './sprites'

export const Resources: Record<string, ex.Loadable<any>> = {}
export const loader = new ex.Loader(Object.values(Resources))
loader.addResources(allSpriteImages)
