import { EditorFrontedController } from '../../ui/game/frontend-controller'
import { CanvasMouseEvent } from '../../ui/game/GameCanvas'
import { SelectableComponent, SelectionStatus } from '../ecs/components'
import { doNothingCallback } from '../ecs/entities/common'
import { Entity } from '../ecs/world'

export interface PointerPreview {
	render: (ctx: CanvasRenderingContext2D) => void
	handleMouse: (e: CanvasMouseEvent) => void
}

export class NullPreview implements PointerPreview {
	render = doNothingCallback
	handleMouse = doNothingCallback
}


export class SelectEntitiesPreview implements PointerPreview {
	private isSelectingMode: boolean = false
	private startX: number = 0 | 0
	private startY: number = 0 | 0
	private endX: number = 0 | 0
	private endY: number = 0 | 0

	constructor(private readonly controller: EditorFrontedController) {
	}

	render(ctx: CanvasRenderingContext2D) {
		if (!this.isSelectingMode) return
		let x, y, w, h

		if (this.startX < this.endX) {
			x = this.startX
			w = this.endX - this.startX
		} else {
			x = this.endX
			w = this.startX - this.endX
		}

		if (this.startY < this.endY) {
			y = this.startY
			h = this.endY - this.startY
		} else {
			y = this.endY
			h = this.startY - this.endY
		}

		ctx.strokeStyle = '#FFF'
		ctx.strokeRect(x, y, w, h)
	}

	handleMouse(e: CanvasMouseEvent) {
		if (e.type === 'leave') {
			this.isSelectingMode = false
			return
		}
		if (e.button === undefined)
			return

		if (e.type === 'up') {
			this.isSelectingMode = false
			const [l, r] = this.startX < this.endX ? [this.startX / 32 | 0, (this.endX / 32 | 0) + 1] : [this.endX / 32 | 0, (this.startX / 32 | 0) + 1]
			const [t, b] = this.startY < this.endY ? [this.startY / 32 | 0, (this.endY / 32 | 0) + 1] : [this.endY / 32 | 0, (this.startY / 32 | 0) + 1]

			const entities: Set<Entity & SelectableComponent> = new Set()

			for (let x = l; x < r; x++) {
				for (let y = t; y < b; y++) {
					const tile = this.controller.game.tiles.getNoThrow(x, y)
					if (tile !== undefined && tile.occupiedBy !== undefined) {
						const entity = tile.occupiedBy as unknown as Entity & SelectableComponent
						if (entity.selectionStatus !== undefined) {
							entities.add(entity)
						}
					}
				}
			}

			for (const e of entities) {
				e.selectionStatus = SelectionStatus.SelectedEditor
			}
			return
		}

		if (e.type === 'down') {
			this.startX = this.endX = e.x
			this.startY = this.endY = e.y
		}

		this.isSelectingMode = true
		this.endX = e.x
		this.endY = e.y
	}
}

