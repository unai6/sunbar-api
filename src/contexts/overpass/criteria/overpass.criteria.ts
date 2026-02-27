export class OverpassCriteria {
  static buildBboxQuery(south: number, west: number, north: number, east: number): string {
    const bbox = `${south},${west},${north},${east}`
    return `
      [out:json][timeout:25];
      (
        node["amenity"~"^(bar|restaurant|cafe|pub|biergarten)$"](${bbox});
        way["building"]["height"](${bbox});
        way["building"]["building:levels"~"^([3-9]|[1-9][0-9]+)$"](${bbox});
      );
      out center meta;
    `
  }
}
