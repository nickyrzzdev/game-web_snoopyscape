import * as ex from 'excalibur'

export const Resources: Record<string, ex.Loadable<any>> = {}
export const loader = new ex.Loader(Object.values(Resources))
