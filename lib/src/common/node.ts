/// Base Class for any and all nodes in the SDK.
/// If you are writing a link, please look at the [dslink.responder.SimpleNode] class.
export class Node {
  static getDisplayName(nameOrPath: string): string {
    if (nameOrPath.includes('/')) {
      let names = nameOrPath.split('/');
      nameOrPath = names.pop();
      while (nameOrPath === '' && names.length) {
        nameOrPath = names.pop();
      }
    }

    if (nameOrPath.includes('%')) {
      nameOrPath = decodeURIComponent(nameOrPath);
    }

    return nameOrPath;
  }

  /// This node's profile.
  profile: Node;

  /// Node Attributes
  attributes: Map<string, any> = new Map();

  /// same as attributes for local node
  /// but different on remote node
  getOverideAttributes(attr: string): object {
    return this.attributes.get(attr);
  }

  /// Get an Attribute
  getAttribute(name: string): any {
    if (this.attributes.has(name)) {
      return this.attributes.get(name);
    }

    if (this.profile != null && this.profile.attributes.has(name)) {
      return this.profile.attributes.get(name);
    }
    return null;
  }

  /// Node Configs
  configs: Map<string, any> = new Map();

  constructor() {
    this.configs.set('$is', 'node');
  }

  /// Get a Config
  getConfig(name: string): object {
    if (this.configs.has(name)) {
      return this.configs.get(name);
    }

    if (this.profile != null && this.profile.configs.has(name)) {
      return this.profile.configs.get(name);
    }
    return null;
  }

  /// Node Children
  /// object of Child Name to Child Node
  children: Map<string, Node> = new Map();

  /// Adds a child to this node.
  addChild(name: string, node: Node) {
    this.children.set(name, node);
  }

  /// Remove a child from this node.
  /// [input] can be either an instance of [Node] or a [string].
  removeChild(input: string) {
    this.children.delete(input);
  }

  /// Get a Child Node
  getChild(name: string): Node {
    if (this.children.has(name)) {
      return this.children.get(name);
    }

    if (this.profile != null && this.profile.children.has(name)) {
      return this.profile.children.get(name);
    }
    return null;
  }

  /// Get a property of this node.
  /// If [name] starts with '$', this will fetch a config.
  /// If [name] starts with a '@', this will fetch an attribute.
  /// Otherwise this will fetch a child.
  get(name: string): object {
    if (name.startsWith('$')) {
      return this.getConfig(name);
    }
    if (name.startsWith('@')) {
      return this.getAttribute(name);
    }
    return this.getChild(name);
  }


  /// Iterates over all the children of this node and passes them to the specified [callback].
  forEachChild(callback: (name: string, node: Node) => void) {
    for (let [name, node] of this.children) {
      callback(name, node);
    }
    if (this.profile != null) {
      for (let [name, node] of  this.profile.children) {
        if (!this.children.has(name)) {
          callback(name, node);
        }
      }
    }
  }

  forEachConfig(callback: (name: string, val: any) => void) {
    for (let [name, val] of this.configs) {
      callback(name, val);
    }
    if (this.profile != null) {
      for (let [name, val] of  this.profile.configs) {
        if (!this.children.has(name)) {
          callback(name, val);
        }
      }
    }
  }

  forEachAttribute(callback: (name: string, val: any) => void) {
    for (let [name, val] of this.attributes) {
      callback(name, val);
    }
    if (this.profile != null) {
      for (let [name, val] of  this.profile.attributes) {
        if (!this.children.has(name)) {
          callback(name, val);
        }
      }
    }
  }

  /// Gets a map for the data that will be listed in the parent node's children property.
  getSimpleMap(): { [key: string]: any } {
    var rslt: { [key: string]: any } = {};
    if (this.configs.has('$is')) {
      rslt['$is'] = this.configs.get('$is');
    }

    if (this.configs.has('$type')) {
      rslt['$type'] = this.configs.get('$type');
    }

    if (this.configs.has('$name')) {
      rslt['$name'] = this.configs.get('$name');
    }

    if (this.configs.has('$invokable')) {
      rslt['$invokable'] = this.configs.get('$invokable');
    }

    if (this.configs.has('$writable')) {
      rslt['$writable'] = this.configs.get('$writable');
    }

    if (this.configs.has('$params')) {
      rslt['$params'] = this.configs.get('$params');
    }

    if (this.configs.has('$columns')) {
      rslt['$columns'] = this.configs.get('$columns');
    }

    if (this.configs.has('$result')) {
      rslt['$result'] = this.configs.get('$result');
    }
    return rslt;
  }
}

/// Utility class for node and config/attribute paths.
export class Path {
  /// Regular Expression for invalid characters in paths.
  static readonly invalidChar: RegExp = /[\\\?\*|"<>:]/;

  /// Regular Expression for invalid characters in names.
  static readonly invalidNameChar: RegExp = /[\/\\\?\*|"<>:]/;

  static escapeName(str: string): string {
    if (Path.invalidNameChar.test(str)) {
      return encodeURIComponent(str);
    }
    return str;
  }

  static getValidPath(path: any, basePath: string): Path {
    if (typeof path === 'string') {
      let p = new Path(path);
      if (p.valid) {
        p.mergeBasePath(basePath);
        return p;
      }
    }
    return null;
  }

  static getValidNodePath(path: any, basePath: string): Path {
    if (typeof path === 'string') {
      let p = new Path(path);
      if (p.valid && p.isNode) {
        p.mergeBasePath(basePath);
        return p;
      }
    }
    return null;
  }

  static getValidAttributePath(path: any, basePath: string): Path {
    if (typeof path === 'string') {
      let p = new Path(path);
      if (p.valid && p.isAttribute) {
        p.mergeBasePath(basePath);
        return p;
      }
    }
    return null;
  }

  static getValidConfigPath(path: any, basePath: string): Path {
    if (typeof path === 'string') {
      let p = new Path(path);
      if (p.valid && p.isConfig) {
        p.mergeBasePath(basePath);
        return p;
      }
    }
    return null;
  }

  /// Real Path
  path: string;

  /// Real Parent Path
  parentPath: string;

  /// Get the parent of this path.
  get parent() {
    return new Path(this.parentPath);
  }

  /// Get a child of this path.
  child(name: string) {
    return new Path(
      (this.path.endsWith("/") ? this.path.substring(0, this.path.length - 1) : this.path) +
      "/" +
      (name.startsWith("/") ? name.substring(1) : name));
  }


  /// The name of this path.
  /// This is the last component of the path.
  /// For the root node, this is '/'
  name: string;

  /// If this path is invalid, this will be false. Otherwise this will be true.
  valid: boolean = true;

  constructor(path: string) {
    this.path = path;
    this._parse();
  }

  _parse() {
    if (this.path == '' || Path.invalidChar.test(this.path) || this.path.includes('//')) {
      this.valid = false;
    }
    if (this.path == '/') {
      this.valid = true;
      this.name = '/';
      this.parentPath = '';
      return;
    }
    if (this.path.endsWith('/')) {
      this.path = this.path.substring(0, this.path.length - 1);
    }
    let pos: number = this.path.lastIndexOf('/');
    if (pos < 0) {
      this.name = this.path;
      this.parentPath = '';
    } else if (pos == 0) {
      this.parentPath = '/';
      this.name = this.path.substring(1);
    } else {
      this.parentPath = this.path.substring(0, pos);
      this.name = this.path.substring(pos + 1);
      if (this.parentPath.includes('/$') || this.parentPath.includes('/@')) {
        // parent path can't be attribute or config
        this.valid = false;
      }
    }
  }

  /// Is this an absolute path?
  get isAbsolute(): boolean {
    return this.name == '/' || this.parentPath.startsWith('/');
  }

  /// Is this the root path?
  get isRoot(): boolean {
    return this.name == '/';
  }

  /// Is this a config?
  get isConfig(): boolean {
    return this.name.startsWith('$');
  }

  /// Is this an attribute?
  get isAttribute(): boolean {
    return this.name.startsWith('@');
  }

  /// Is this a node?
  get isNode(): boolean {
    return !this.name.startsWith('@') && !this.name.startsWith('$');
  }

  /// Merges the [base] path with this path.
  mergeBasePath(base: string, force: boolean = false) {
    if (base == null) {
      return;
    }

    if (!this.isAbsolute) {
      if (this.parentPath == '') {
        this.parentPath = base;
      } else {
        this.parentPath = '$base/$parentPath';
      }
      this.path = '$parentPath/$name';
    } else if (force) {
      // apply base path on a absolute path
      if (name == '') {
        // map the root path
        this.path = base;
        this._parse();
      } else {
        this.parentPath = '$base$parentPath';
        this.path = '$parentPath/$name';
      }
    }
  }
}
