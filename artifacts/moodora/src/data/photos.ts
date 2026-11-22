const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=700`;

/** Sample photos (Pexels) used across the app, by name. */
export const photo = {
  mountains: pexels(1287145),
  palms: pexels(1005417),
  shore: pexels(1024960),
  desk: pexels(1051075),
  room: pexels(1125136),
  sunhat: pexels(1382731),
  stripes: pexels(1462637),
  lake: pexels(1586298),
  peak: pexels(1366919),
  clouds: pexels(531756),
  latte: pexels(302899),
  sea: pexels(1001682),
  polka: pexels(1021693),
  butterflies: pexels(326055),
};

export const photos: string[] = [
  photo.stripes,
  photo.clouds,
  photo.sunhat,
  photo.sea,
  photo.shore,
  photo.lake,
  photo.polka,
  photo.mountains,
  photo.palms,
  photo.desk,
  photo.latte,
  photo.room,
  photo.peak,
  photo.butterflies,
];
