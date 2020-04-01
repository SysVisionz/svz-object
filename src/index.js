const isOfType = (item, types) => types.includes(typeof item);

class SVZObject {
	constructor(object){
		if (object && !isOfType(object, ['object', 'number'])){
			this.err('type', 'this.object', ['object', 'number'])
		}
		this.object = object;
		this.match = this.match.bind(this);
		this.filter = this.filter.bind(this);
		this.switchVals = this.switchVals.bind(this);
		this.includes = this.includes.bind(this);
		this.indexOf = this.indexOf.bind(this);
	}

	err = (type, name, values, func) => {
		const last = values && values.splice ? values.splice(-1, 1)[0] : values;
		const end = `${typeof values === 'object' && values.length ? `"${values.join('," "')}" or ` : ''}"${last}"`
		const rightA = ['a', 'e', 'i', 'o', 'u'].includes(end.charAt(1)) ? 'an' : 'a';
		switch(type){
			case 'type':
				throw `TypeError: ${name} must be ${rightA} ${end}`
			case 'already':
				throw `TypeError: ${name} is already of type ${end}`
			case 'need':
				throw `TypeError: ${name} requires ${rightA} ${end}`
			case 'create':
				throw `TypeError: ${func} requires ${name} to be ${rightA} ${end}`
			default:
				throw 'Error of undefined type.'
		}
	}

	set type(value){
		if (value === 'array'){
			const newObj = [];
			let index = 0;
			for (const i in this.object){
				if (Number.parseInt(i) == i){
					this.object[i] = this.object[i];
				}
				else {
					while (newObj[index]){
						index++;
					}
					newObj[index] = this.object[i];
				}
				index++;
			}
		}
		else if (value === 'object') {
			const newObj = {};
			for (const i in this.object){
				if (this.object[i]){
					newObj[i] = this.object[i];
				}
			}
			this.object = newObj;
		}
	}

	setWithKeys = (value, keys) => {
		if (this.type === value){
			this.err('already', 'this.type', value);
		}
		if (!['array', 'object'].includes(this.type)){
			this.error('type', 'value', ['"array"', '"object"'])
		}
		const newObj = value === 'array' ? [] : {}
		if (value === 'array'){
			let index = 0;
			for (const i in this.object){
				if (Number.parseInt(i) == i){
					newObj[i] = this.object[i];
					if (i > index){
						index = i;
					}
				}
				else {
					newObj[index] = this.object[i];
				}
				index++;
			}
		}
		else if (value === 'object'){
			for (const i in this.object){
				newObj[i] = this.object[i];
			}
		}
		this.object = newObj;
	}

	get type(){ return this.object ? this.object.indexOf ? 'array' : 'object' : null}

	set object(val) { 
		if (val && !['object', 'number'].includes(typeof val) ) {
			this.err('type', 'this.object', ['object', 'number']);
		}
		this.objectVal = typeof val === 'object' ? val : new Array(val);
	}

	get object(){ return this.objectVal}

	sequential = (
		lengthOrRangeOrKeyOrder,
		init = 0,
		callback = val => val+1, 
		usePrevious
	) => {
		let curVal = init;
		// if this.object, you're just redefining things sequentially within this.object. 
		// if init or key order is defined and is not 0, it can be assumed it is an object, otherwise it's an array.
		this.object = this.object || this.newOfType(lengthOrRangeOrKeyOrder);
		const keyOrder = [];
		if (typeof lengthOrRangeOrKeyOrder === 'string'){
			const keyOrderObj = lengthOrRangeOrKeyOrder.split(',');
			for (const i in keyOrderObj){
				keyOrderObj[i] = keyOrderObj[i].trim().split('...');
				keyOrderObj[i][0] = Number(keyOrderObj[i][0]);
				keyOrderObj[i][1] = Number(keyOrderObj[i][1]);
				for (let index = keyOrderObj[i][0]; index < keyOrderObj[i][1]; index++){
					keyOrder.push(index);
				}
			}
		}
		else if (typeof lengthOrRangeOrKeyOrder === 'number'){
			for (let i = 0; i < lengthOrRangeOrKeyOrder; i++){
				keyOrder.push(i);
			}
		}
		else if (typeof lengthOrRangeOrKeyOrder === 'object' && lengthOrRangeOrKeyOrder.indexOf){
			keyOrder = lengthOrRangeOrKeyOrder;
		}
		else {
			this.err('type', 'lengthOrRangeOrKeyOrder', ['string', 'number', 'array'])
		}
		for (const i = 0; i < keyOrder.length; i++) {
			if (i === 0){
				this.object[keyOrder[i]] = init;
				continue;
			}
			this.object[keyOrder[i]] = callback(this.object[keyOrder[i-1]]);
		}
	}

	indexOf = function() {
		let object, target;
		[object, target] = arguments.length === 2 ? [arguments[0], arguments[1]] : [this.object, arguments[0]];
		for (const i in object){
			if (object[i] === target){
				return i;
			}
		}
		return false;
	}

	removeDuplicates = useLast => {
		if (this.type === 'object'){
			this.err('type', 'this.object', 'array')
		}
		for (const i in this.object){
			if (this.object.lastIndexOf(this.object[i]) !== i){
				if (useLast){
					this.splice(this.object.splice(i, 1))
				}
				else {
					while (this.object.lastIndexOf(this.object[i]) !== i){
						this.object.splice(this.object.lastIndexOf(this.object[i]), 1)
					}
				}
			}
		}
	}

	count = val => {
		const counter = {...this.object};
		let countVal = 0;
		while (~counter.indexOf(val)){
			countVal++;
			counter.splice(counter.indexOf(val), 1);
		}
	}

	get hasDuplicates() {
		if (this.type === 'array'){
			for (const i in this.object){
				if (this.object.lastIndexOf(this.object[i]) != i){
					return true;
				} 
			}
		}
		else {
			const checker = new SVZObject(this.object);
			checker.type = 'array';
			return checker.hasDuplicates;
		}
		return false;
	}

	keysMakeConsecutiveArray = keys => {
		const val = new SVZObject(keys)
		if (val.hasDuplicates){
			return false;
		}
		for (const i in keys){
			if (Number.parseInt(keys[i]) != keys[i] || keys[i] >= keys.length || keys[i] < 0){
				return false;
			}
		}
		return true;
	}

	fill = (val, keys, overwrite = true) => {
		if (!this.object){
			if (!keys){
				this.err('create', 'keys', ['Array', 'Integer'], 'this.fill')
			}
			if (typeof keys === 'number'){
				if (Number.parseInt(keys) !== keys){
					this.err('create', 'keys', ['Array','Integer'], 'this.fill')
				}
				return this.object = Array(keys).fill(val);
			}
			if (this.keysMakeConsecutiveArray(keys)){
				this.object = [];
			}
			else {
				this.object = {};
			}
			console.log(this.object);
		}
		if (keys){
			if (!keys.indexOf && typeof keys !== 'number'){
				this.err('type','keys', ['Array', 'Integer'])
			}
			if (typeof keys === 'object'){
				for (const i in keys){
					if (overwrite || this.object[keys[i]] === undefined){
						this.object[keys[i]] = val;
					}
				}
				return this.object;
			}
			else if (typeof keys === 'number') {
				const init = keys < 0 ? Math.max(...Object.keys(this.object).map(a => Number.parseInt(a))) : 0;
    			for (let i = init; keys < 0 ? i > 0 && i > init + keys : i < keys; keys < 0 ? i-- : i++){
					if (overwrite || this.object[keys[i]] === undefined){
						this.object[i] = val;
					}
				}
			    return this.object;
			}
		}
		for (const i in this.object){
			if (overwrite || this.object[keys[i]] === undefined){
				this.object[i] = val;
			}
		}
		return this.object;
	}

	filter = function() {
		const object = arguments.length > 0 && typeof arguments[0] === 'object' ? arguments[0] : this.object;
		const test = typeof arguments[0] === 'function' ? arguments[0] : typeof arguments[1] === 'function' ? arguments[1] : val => val !== undefined;
		if (arguments.length === 2){
			[object, test] = arguments;
		}
		if (object.filter){
			return object.filter(test);
		}
		//this provides a filter functionality for Objects similar to that within Arrays
		//allowing you to remove values from the Object that don't match a test criteria.
		for (const i in object){
			if (!test(object[i])){
				delete object[i];
			}
		}
		return object;
	}

	filterJoin = (joinVal = ' ') =>  {
		if (this.type === 'object'){
			this.err('type', 'this.object', 'Array', 'filterJoin')
		}
		return this.object.filter(a => typeof a === 'object' ? a[0] : a ).map(i => typeof i === 'object' ? i[1] : i).join(joinVal)
	}

	map = callback => {
		return this.type === 'object'
		? Object.keys(this.object).map(key => callback(this.object[key], key))
		: this.object.map((val, i) => callback(val, i))
	}

	sortKeys = callback => {
		const retval = [];
		for (const i in this.object){
			const added = false;
			for (const inner in retval){
				if (!callback(this.object[i], this.retval[inner])) {
					this.retval.splice(inner, 0, i)
					added = true;
					break;
				}
			}
			if (!added){
				retval.push(i);
			}
		}
		return retval;
	}

	splitUp = (root = 3) => {
		if (this.type !== 'array'){
			this.err('func', 'this.object', 'Array', 'splitUp')
		}
		const factor = 1/root;
		const obj = [...this.object];
		const retval = [obj];
		const rootVal = Math.floor(Math.pow(obj.length, factor))
		const limit = Math.floor(obj.length/rootVal)
		for (let i = 0; i < limit; i++){
			retval[i+1] = retval[i].splice(rootVal);
		}
		return retval;
	}

	standardized = index => {
		//checks if all values at an index location or just at a base level are matching..
		if (this.type !== 'array'){
			this.err('func', 'this.object', 'Array', 'standardized');
		}
		for (let i = 1; i < this.object.length; i++){
			if (index){
				if (this.object[i][index] !== this.object[i-1][index]){
					return false;
				}
			}
			else if (this.object[i] !== this.object[i-1]){
				return false;
			}
		}
		return index 
			? this.object[0][index] === undefined ? null : this.object[0][index] 
			: this.object[0] === undefined ? null : this.object[0]
	}

	newOfType = (object = this.copy()) => object.indexOf ? [] : {};

	subInsert = (target, current = this.copy()) => {
	    for (const i in target){
	        if (typeof target[i] === 'object' && current[i]){
	            return this.subInsert(target[i], current[i])
	        }
	        current[i] = target[i];
	        return current;
	    }
	    if (current.filter){
	        return current.filter(el => el !== undefined);
	    }
	}

	subOverwrite = (target, newVal, current = this.copy()) => {
		if (typeof target === 'object'){
			for (const i in target){
		        current[i] = this.subOverwrite(target[i], newVal, current[i])
		    }
			current[target] = newVal;
		    this.object = current;
		}
	}

	// join = (object, type = 'full') => {
	// 	const retval = this.newOfType();
	// 	switch(type){
	// 		case 'inner':
	// 			for (const i in object){
	// 				if (this.indexOf(object[i])){
	// 					retval[i] = object[i];
	// 				}
	// 			}
	// 		case 'full':
	// 		case 'outer':
	// 		case 'left':
	// 		case 'right':
	// 		default: 
	// 			if (typeof type !== 'function'){
	// 				throw ''
	// 			}
	// 			return this.object.filter()
	// 	}
	// }

	includes = function(){
		let object, target;
		[object, target] = arguments.length === 1 ? [this.copy(), arguments[0]] : [arguments[0], arguments[1]];
		if (object.includes){
			return object.includes(target);
		}
		for (const i in object){
			if (object[i] === target){
				return true;
			}
		}
		return false;
	}

	copy = () => this.type === 'array' ? [...this.object] : {...this.object};

	switchVals = function(){
		let current, change;
		[current, change] = arguments.length === 1 ? [this.copy(), arguments[0]] : arguments;
		const holding = current[change[0]];
		current[change[0]] = current[change[1]];
		current[change[1]] = holding;
		return current;
	}

	match = function () {
		let objects = [];
		let matches;
		let filter;
		let universal;
		if (typeof arguments[0] !== 'object'){
			this.err('type', 'first argument', 'object');
		}
		if (typeof arguments[1] === 'object'){
			[objects[0], objects[1], matches = true, filter = true, universal]= arguments;
		}
		else {
			[objects[0], objects[1], matches = true, filter = true, universal] = [this.copy(), arguments[0], arguments[1], arguments[2], arguments[3]];
		}
		// behavior changes if the second value is an array and the first is an object, making it so the check is matching the value within the array, not checking against position.
		// if both are arrays, that behavior is already occuring. If both are objects, or both are arrays, and we are doing an outer type match, we are returning an array containing
		// one object or array for each of them with values that did not match.
		let oneRet;
		let retval;
		if (matches){
			retval = this.newOfType(objects[0]);
		}
		else{
			oneRet = !objects[0].indexOf && objects[1].indexOf;
			retval = oneRet ? objects[0] : retval = [objects[0], objects[1]];
		}
		// deleteAll is only used here, and it just removes all entries containing that variable. It's only used if universal is true.
		const deleteAll = (arr, toDelete) => {
			while (this.includes(arr, toDelete)){
				delete arr[this.indexOf(arr, toDelete)];
			}
			return arr;
		}
		for (const i in objects[1]){
			if (matches){
				if (!objects[1].indexOf && !objects[0].indexOf){
					if (objects[0][i] === objects[1][i]){
						retval[i] = objects[1][i];
					}
				}
				else if (this.includes(objects[0], objects[1][i]) ){
					retval[i] = objects[1][i];
				}
			}
			else{
				if (!oneRet && this.includes(retval[0], objects[1][i])){
					if (universal){
						retval[0] = deleteAll(retval[0], objects[1][i]);
						retval[1] = deleteAll(retval[1], objects[1][i]);
					}
					else{
						delete retval[0][this.indexOf(retval[0], objects[1][i])];
						delete retval[1][this.indexOf(retval[1], objects[1][i])];
					}
				}
				else if (oneRet && this.includes(retval, objects[1][i])){
					if (universal){
						retval = deleteAll(retval, objects[1][i]);
					}
					else {
						delete retval[this.indexOf(retval, objects[1][i])];
					}
				}
			}
		}

		if (typeof filter === 'function'){
			return oneRet ? this.filter(retval, filter) : [this.filter(retval[0], filter), this.filter(retval[1], filter)]
		}
		if (filter){
			return oneRet ? this.filter(retval) : [this.filter(retval[0]), this.filter(retval[1])];
		}
		return oneRet ? [this.filter(retval[0]), this.filter([retval[1]])] : retval;
	}
	
	only = (arr, noFilter) => {
		if (!this.object){
			this.err('create', 'this.object', ['Array', 'Object'], 'only')
		}
		const retval = this.type === 'array' ? [] : {}
		for (const i in arr){
			retval[i] = this.object[i];
		}
		return noFilter ? retval.filter(a => a !== undefined) : retval;
	}
}

export {SVZObject};