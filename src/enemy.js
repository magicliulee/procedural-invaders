import { integer } from 'cervus/core/random';
import { Thing } from './thing';
import { physics_world, game, wire_material } from './globals';
import { RigidBody } from 'cervus/components';

export class EnemyShape {
	constructor() {
		this.width = 3;
		this.height = 5;
		this.shape = [];
		this.second_shape = [];

		this.size = {
			y: this.height,
			x: (this.width * 2) -1
		};

		for (let y = 0; y < this.height; y++) {
			this.shape[y] = [];
			this.second_shape[y] = [];

			for (let x = 0; x < this.width; x++) {
				this.shape[y][x] = this.second_shape[y][x] = integer(0, 1);
			}

			this.shape[y] = this.mirror(this.shape[y]);
		}

		// This is poor man's animation
		this.second_shape = this.create_second_shape(this.second_shape);
	}

	create_second_shape(shape) {
		const i = integer(0, shape.length-1);
		shape[i] = shape[i].map(() => integer(0, 1));

		return shape.map(this.mirror);
	}

	mirror(array) {
		return array.concat(array.slice().reverse().splice(1));
	}
}

export class Enemy extends Thing {
	constructor(options) {
		super(options);

		this.starting_row = options.starting_row || 0;

		this.count = 0;

		this.frames_count = 2;
		this.active_frame = 1;
		this.frames = [
			this.build_from_shape(options.shape.shape, this.starting_row),
			this.build_from_shape(options.shape.second_shape, this.starting_row)
		];

		this.group.add(this.frames[this.active_frame]);
	}

	change_frames() {
		this.group.entities.delete(this.frames[this.active_frame]);
		this.active_frame = this.count%this.frames_count;
		this.group.add(this.frames[this.active_frame]);
		this.count++;
	}

	kill() {
		this.elements = [];
		this.group.entities.delete(this.frames[this.active_frame]);
		Array.from(this.frames[this.active_frame].entities).forEach(element => {
			element.render_component.material = wire_material;
			element.parent = null;
			element.transform_component.scale = this.transform.scale;
			element.transform_component.position = [
				element.transform_component.position[0] * this._scale + this.transform.position[0],
				element.transform_component.position[1] * this._scale + this.transform.position[1],
				0,
			];
			game.add(element);
			this.elements.push(element);
			element.rigid_body_component = new RigidBody({
				world: physics_world,
				shape: 'box',
				mass: 40
			});
			element.add_component(element.rigid_body_component);
		});
		setTimeout(() => {
			this.remove_rigids_from_world()
		}, 2000);
	}
}
