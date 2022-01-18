export class Pool {

    constructor ( factory, pool ) {

        var k, v, _ref;
        this.factory = factory;
        this.objects = {};
        if ((pool != null) && (pool.objects != null)) {
            _ref = pool.objects;
            for (k in _ref) {
                v = _ref[k];
                this.objects[k] = this.factory.copy(v);
            }
        }

    }

    get length() {
        return Object.keys(this.objects).length;
    }

    toJSON() {
        return this.objects;
    }

    get( id ) {
        return this.objects[id];
    }

    put( obj ) {
        return this.objects[obj.id] = obj;
    }

    pop ( obj ) {
        var id, result, _ref;
        id = (_ref = obj.id) != null ? _ref : obj;
        result = this.objects[id];
        if (typeof result.release === "function") {
            result.release();
        }
        delete this.objects[id];
        return result;
    }

    all() {
        return this.objects;
    }

    clear() {
        return this.objects = {};
    }

}