import { GameInstance } from '../game-instance'
import { AnimationFrames } from './entities/common'
import { Tile } from './systems/tiles-system'
import World, { Entity } from './world'

export type ComponentNameType =
	'DrawableBaseComponent'
	| 'StateMachineHolderComponent'
	| 'MovingDrawableComponent'
	| 'AnimatableDrawableComponent'
	| 'TilesIncumbentComponent'
	| 'TileListenerComponent'
	| 'SelfLifecycleObserverComponent'
	| 'DelayedHideComponent'
	| 'DamageableComponent'

export type RenderFunction = (ctx: CanvasRenderingContext2D) => void

/**
 * Component for rendering anything on the screen
 */
export interface DrawableBaseComponent {
	render: RenderFunction
}


/**
 * Component for rendering drawable on the screen that may change it's properties, but they are defined
 */
export interface PredefinedDrawableComponent extends DrawableBaseComponent {
	texture: CanvasImageSource
	destinationDrawX: number
	destinationDrawY: number
	sourceDrawX: number
	sourceDrawY: number
	spriteSize: number
}

/**
 * Component for rendering drawable that moves with at user render framerate
 */
export interface MovingDrawableComponent extends PredefinedDrawableComponent {
	spriteVelocityX: number
	spriteVelocityY: number
}

/**
 * Component for automatic hiding a drawable component when a some about of time passes (in millis)
 */
export interface DelayedHideComponent extends DrawableBaseComponent {
	hideMeAtMillis: number
}

export const PredefinedDrawableComponent_render: RenderFunction = function (this: PredefinedDrawableComponent, ctx: CanvasRenderingContext2D) {
	const size = this.spriteSize
	ctx.drawImage(this.texture,
		this.sourceDrawX, this.sourceDrawY,
		size, size,
		this.destinationDrawX, this.destinationDrawY,
		size, size)
}

export interface AnimatableDrawableComponent extends PredefinedDrawableComponent {
	currentAnimationFrame: number
	currentAnimation: AnimationFrames
}

/**
 * Object passed to each and every state update
 */
export interface UpdateContext {
	readonly game: GameInstance
	readonly world: World
	readonly currentTick: number
}

export type UpdateStateMachineFunction = (ctx: UpdateContext) => void

/**
 * Component for entities that needs to be updated every frame
 */
export interface StateMachineHolderComponent {
	updateState: UpdateStateMachineFunction
}


/**
 * Component for entities that may occupy tiles
 */
export interface TilesIncumbentComponent {
	mostWestTile: number
	mostNorthTile: number
	tileOccupySize: number
}

export type TeamId = number

/**
 * Component for entities that can accept damage and do belong to a team
 */
export interface DamageableComponent {
	myTeamId: TeamId
	readonly hitBoxCenterX: number
	readonly hitBoxCenterY: number
}

export type TileOccupationChangedCallback = (listener: Entity & TileListenerComponent,
                                             tile: Tile,
                                             occupiedByFrom: (Entity & TilesIncumbentComponent) | undefined,
                                             occupiedByTo: (Entity & TilesIncumbentComponent) | undefined) => void

/**
 * Component for entities that receive tile updates
 */
export interface TileListenerComponent {
	subscribedToTiles: Set<Tile>
	onListenedTileOccupationChanged: TileOccupationChangedCallback
}


/**
 * Component for entities that want to execute custom code after they are initialized and before they are removed
 */
export interface SelfLifecycleObserverComponent {
	entityCreated(game: GameInstance): void

	entityRemoved(game: GameInstance): void
}