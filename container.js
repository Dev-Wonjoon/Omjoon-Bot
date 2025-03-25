const PARAMS = /constructor\s*[^(]*\(\s*([^)]*)\)/m;

function getParamNames(Clazz) {
    const match = Clazz.toString().match(PARAMS);
    return match && match[1]
        .split(',')
        .map(p => p.trim())
        .filter(Boolean) || [];
}

class Container {
    constructor() {
        this.providers = new Map();
        this.cache = new Map();
    }

    register(name, provider, { singletone = true} = {}) {
        this.providers.set(name, { provider, singletone });
    }

    registerClass(Clazz, options) {
        this.register(Clazz.name, Clazz, options);
    }

    resolve(name) {
        if (this.cache.has(name)) return this.cache.get(name);

        const entry = this.providers.get(name);
        if(!entry) throw new Error(`No providers for ${name}`);

        let instance;
        if (typeof entry.provider === 'function' && entry.provider.prototype) {
            const deps = getParamNames(entry.provider).map(dep => this.resolve(dep));
            instance = new entry.provider(...deps);
        } else if(typeof entry.provider === 'function') {
            instance = entry.provider(this);
        } else {
            instance = entry.provider;
        }

        if (entry.singletone) this.cache.set(name, instance);
        return instance;
    }
}

module.exports = new Container();