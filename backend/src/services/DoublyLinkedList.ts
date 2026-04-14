/**
 * DoublyLinkedList - Core data structure for the music playlist
 * Implements all required operations: add (start/end/position), remove, next, prev
 * Pattern: Generic typed node structure with O(1) head/tail operations
 */

export class DLLNode<T> {
  public data: T;
  public next: DLLNode<T> | null = null;
  public prev: DLLNode<T> | null = null;

  constructor(data: T) {
    this.data = data;
  }
}

export class DoublyLinkedList<T> {
  private head: DLLNode<T> | null = null;
  private tail: DLLNode<T> | null = null;
  private _size: number = 0;
  private current: DLLNode<T> | null = null;

  get size(): number { return this._size; }
  get isEmpty(): boolean { return this._size === 0; }
  get currentNode(): DLLNode<T> | null { return this.current; }

  // ─── Add Operations ────────────────────────────────────────────────────────

  addFirst(data: T): void {
    const node = new DLLNode(data);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this._size++;
    if (!this.current) this.current = this.head;
  }

  addLast(data: T): void {
    const node = new DLLNode(data);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this._size++;
    if (!this.current) this.current = this.head;
  }

  addAt(index: number, data: T): void {
    if (index <= 0) return this.addFirst(data);
    if (index >= this._size) return this.addLast(data);

    const newNode = new DLLNode(data);
    let curr = this.head;
    for (let i = 0; i < index - 1 && curr; i++) curr = curr.next;

    if (!curr) return;
    newNode.next = curr.next;
    newNode.prev = curr;
    if (curr.next) curr.next.prev = newNode;
    curr.next = newNode;
    this._size++;
  }

  // ─── Remove Operations ─────────────────────────────────────────────────────

  removeFirst(): T | null {
    if (!this.head) return null;
    const data = this.head.data;
    if (this.current === this.head) this.current = this.head.next;
    this.head = this.head.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    this._size--;
    return data;
  }

  removeLast(): T | null {
    if (!this.tail) return null;
    const data = this.tail.data;
    if (this.current === this.tail) this.current = this.tail.prev;
    this.tail = this.tail.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    this._size--;
    return data;
  }

  removeAt(index: number): T | null {
    if (index < 0 || index >= this._size) return null;
    if (index === 0) return this.removeFirst();
    if (index === this._size - 1) return this.removeLast();

    let curr = this.head;
    for (let i = 0; i < index && curr; i++) curr = curr.next;
    if (!curr) return null;

    if (this.current === curr) this.current = curr.next || curr.prev;
    if (curr.prev) curr.prev.next = curr.next;
    if (curr.next) curr.next.prev = curr.prev;
    this._size--;
    return curr.data;
  }

  removeByPredicate(predicate: (data: T) => boolean): T | null {
    let curr = this.head;
    let index = 0;
    while (curr) {
      if (predicate(curr.data)) return this.removeAt(index);
      curr = curr.next;
      index++;
    }
    return null;
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  setCurrent(index: number): boolean {
    let curr = this.head;
    for (let i = 0; i < index && curr; i++) curr = curr.next;
    if (!curr) return false;
    this.current = curr;
    return true;
  }

  setCurrentByPredicate(predicate: (data: T) => boolean): boolean {
    let curr = this.head;
    while (curr) {
      if (predicate(curr.data)) { this.current = curr; return true; }
      curr = curr.next;
    }
    return false;
  }

  next(loop = true): T | null {
    if (!this.current) return null;
    if (this.current.next) {
      this.current = this.current.next;
      return this.current.data;
    }
    if (loop && this.head) {
      this.current = this.head;
      return this.current.data;
    }
    return null;
  }

  prev(loop = true): T | null {
    if (!this.current) return null;
    if (this.current.prev) {
      this.current = this.current.prev;
      return this.current.data;
    }
    if (loop && this.tail) {
      this.current = this.tail;
      return this.current.data;
    }
    return null;
  }

  getCurrentData(): T | null {
    return this.current?.data ?? null;
  }

  getCurrentIndex(): number {
    let curr = this.head;
    let i = 0;
    while (curr) {
      if (curr === this.current) return i;
      curr = curr.next;
      i++;
    }
    return -1;
  }

  // ─── Query & Utility ───────────────────────────────────────────────────────

  toArray(): T[] {
    const arr: T[] = [];
    let curr = this.head;
    while (curr) { arr.push(curr.data); curr = curr.next; }
    return arr;
  }

  fromArray(items: T[]): void {
    this.clear();
    items.forEach(item => this.addLast(item));
  }

  shuffle(): void {
    const arr = this.toArray();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    this.fromArray(arr);
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.current = null;
    this._size = 0;
  }

  serialize(): { items: T[]; currentIndex: number } {
    return { items: this.toArray(), currentIndex: this.getCurrentIndex() };
  }

  deserialize(data: { items: T[]; currentIndex: number }): void {
    this.fromArray(data.items);
    if (data.currentIndex >= 0) this.setCurrent(data.currentIndex);
  }
}
