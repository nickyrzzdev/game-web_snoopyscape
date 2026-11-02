import * as ex from 'excalibur'

export function getInputDirection(engine: ex.Engine): ex.Vector {
  const keyboard = engine.input.keyboard
  const x =
    Number(keyboard.isHeld(ex.Keys.D) || keyboard.isHeld(ex.Keys.Right)) -
    Number(keyboard.isHeld(ex.Keys.A) || keyboard.isHeld(ex.Keys.Left))
  const y =
    Number(keyboard.isHeld(ex.Keys.S) || keyboard.isHeld(ex.Keys.Down)) -
    Number(keyboard.isHeld(ex.Keys.W) || keyboard.isHeld(ex.Keys.Up))
  const direction = new ex.Vector(x, y)

  // Normaliza apenas quando há uma direção, para manter a diagonal na mesma velocidade.
  return direction.magnitude > 0 ? direction.normalize() : ex.Vector.Zero
}
