/**
 * DoublyLinkedListClient - Frontend mirror of backend DLL
 * Used directly by Zustand player store for O(1) next/prev navigation
 */

class DLLNode<T> {
  data: T;
  next: DLLNode<T> | null = null;
  prev: DLLNode<T> | null = null;
  constructor(data: T) { this.data = data; }
}

export class DoublyLinkedListClient<T> {
  private head: DLLNode<T> | null = null;
  private tail: DLLNode<T> | null = null;
  private _size = 0;
  private current: DLLNode<T> | null = null;

  get size() { return this._size; }

  addFirst(data: T): void {
    const n = new DLLNode(data);
    if (!this.head) { this.head = this.tail = n; }
    else { n.next = this.head; this.head.prev = n; this.head = n; }
    this._size++;
    if (!this.current) this.current = this.head;
  }

  addLast(data: T): void {
    const n = new DLLNode(data);
    if (!this.tail) { this.head = this.tail = n; }
    else { n.prev = this.tail; this.tail.next = n; this.tail = n; }
    this._size++;
    if (!this.current) this.current = this.head;
  }

  addAt(index: number, data: T): void {
    if (index <= 0) return this.addFirst(data);
    if (index >= this._size) return this.addLast(data);
    const n = new DLLNode(data);
    let curr = this.head;
    for (let i = 0; i < index - 1 && curr; i++) curr = curr.next;
    if (!curr) return;
    n.next = curr.next; n.prev = curr;
    if (curr.next) curr.next.prev = n;
    curr.next = n; this._size++;
  }

  removeAt(index: number): T | null {
    if (index < 0 || index >= this._size) return null;
    let curr = this.head;
    for (let i = 0; i < index && curr; i++) curr = curr.next;
    if (!curr) return null;
    if (this.current === curr) this.current = curr.next || curr.prev;
    if (curr.prev) curr.prev.next = curr.next;
    else this.head = curr.next;
    if (curr.next) curr.next.prev = curr.prev;
    else this.tail = curr.prev;
    this._size--;
    return curr.data;
  }

  setCurrent(index: number): boolean {
    let curr = this.head;
    for (let i = 0; i < index && curr; i++) curr = curr.next;
    if (!curr) return false;
    this.current = curr; return true;
  }

  getCurrentIndex(): number {
    let curr = this.head; let i = 0;
    while (curr) { if (curr === this.current) return i; curr = curr.next; i++; }
    return -1;
  }

  getCurrentData(): T | null { return this.current?.data ?? null; }

  next(loop = true): T | null {
    if (!this.current) return null;
    if (this.current.next) { this.current = this.current.next; return this.current.data; }
    if (loop && this.head) { this.current = this.head; return this.current.data; }
    return null;
  }

  prev(loop = true): T | null {
    if (!this.current) return null;
    if (this.current.prev) { this.current = this.current.prev; return this.current.data; }
    if (loop && this.tail) { this.current = this.tail; return this.current.data; }
    return null;
  }

  toArray(): T[] {
    const arr: T[] = []; let curr = this.head;
    while (curr) { arr.push(curr.data); curr = curr.next; }
    return arr;
  }

  fromArray(items: T[]): void {
    this.clear();
    items.forEach(i => this.addLast(i));
  }

  clear(): void { this.head = null; this.tail = null; this.current = null; this._size = 0; }
}
