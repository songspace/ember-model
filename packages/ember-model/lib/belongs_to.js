var get = Ember.get,
    set = Ember.set;

function getType() {
  if (typeof this.type === "string") {
    this.type =  Ember.get(Ember.lookup, this.type);
  }
  return this.type;
}

Ember.belongsTo = function (type, options) {
  options = options || {};

  var meta = { type: type, isRelationship: true, options: options, kind: 'belongsTo', getType: getType, lastValue: null },
      relationshipKey = options.key;

  return Ember.computed('_data', {
    get: function() {
      var type = meta.getType(meta.type, this.container);
      return meta.lastValue = this.getBelongsTo(relationshipKey, type, meta);
    },
    set: function(key, value) {
      type = meta.getType();

      var dirtyAttributes = get(this, '_dirtyAttributes'),
          createdDirtyAttributes = false;

      if (!dirtyAttributes) {
        dirtyAttributes = [];
        createdDirtyAttributes = true;
      }

      if (value) {
        Ember.assert(Ember.String.fmt('Attempted to set property of type: %@ with a value of type: %@',
                     [value.constructor, type]),
                     value instanceof type);

        if (meta.lastValue !== value) {
          dirtyAttributes.pushObject(key);
        } else {
          dirtyAttributes.removeObject(key);
        }

        if (createdDirtyAttributes) {
          set(this, '_dirtyAttributes', dirtyAttributes);
        }
      }
      return meta.lastValue = value === undefined ? null : value;
    }
  }).meta(meta);
};

Ember.Model.reopen({
  getBelongsTo: function(key, type, meta) {
    var idOrAttrs = get(this, '_data.' + key),
        record;

    if (Ember.isNone(idOrAttrs)) {
      return null;
    }

    if (meta.options.embedded) {
      var primaryKey = get(type, 'primaryKey'),
        id = idOrAttrs[primaryKey];
      record = type.create({ isLoaded: false, id: id });
      record.load(id, idOrAttrs);
    } else {
      record = type.find(idOrAttrs);
    }

    return record;
  }
});
