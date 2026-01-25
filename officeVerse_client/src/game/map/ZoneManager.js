export default class ZoneManager {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;
    this.zones = this.scene.physics.add.staticGroup();
  }

  createZones() {
    const zoneLayer = this.map.getObjectLayer('zone');

    if (!zoneLayer) return this.zones;

    zoneLayer.objects.forEach(obj => {
      // Create physics zone
      const zone = this.scene.add.rectangle(
        obj.x + obj.width / 2,
        obj.y + obj.height / 2,
        obj.width,
        obj.height
      );

      this.scene.physics.add.existing(zone, true);
      zone.name = obj.name;
      zone.setVisible(true); // Debug visibility
      zone.setFillStyle(0x0000ff, 0.4); // Semi-transparent blue
      console.log(`[ZONE_DEBUG] created: ${zone.name} at (${zone.x}, ${zone.y})`);
      this.zones.add(zone);
    });

    return this.zones;
  }
}
