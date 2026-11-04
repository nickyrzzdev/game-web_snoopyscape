import * as ex from 'excalibur'

const assetPath = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`

export const Resources = {
  player: new ex.ImageSource(assetPath('sprites/player.svg')),
  enemy: new ex.ImageSource(assetPath('sprites/enemy.svg')),
  boss: new ex.ImageSource(assetPath('sprites/boss.svg')),
  bullet: new ex.ImageSource(assetPath('sprites/bullet.svg')),
  wall: new ex.ImageSource(assetPath('sprites/wall.svg')),
}

export const loader = new ex.Loader(Object.values(Resources))
