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
      zone.setVisible(false); // Make physics zones invisible
      this.zones.add(zone);
    });

    return this.zones;
  }
}
