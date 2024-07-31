export const createMessageCheckWay = (collections: any, data: any): string => {
  const existingRef = collections.find((ref: any) => ref.ref === data.ref);
  if (existingRef) {
    const highwayIndex = existingRef.highways.findIndex(
      (item: any) => item.highway_name === data.highways[0].highway_name
    );
    if (highwayIndex >= 0) {
      return `'${existingRef.highways[highwayIndex].highway_name}' đã tồn tại trong '${existingRef.ref}'. Bạn có chắc chắn muốn thêm tuyến đường mới?`;
    } else {
      return `'${existingRef.ref}' đã tồn tại và '${data.highways[0].highway_name}' chưa có trong tuyến đường. Bạn có chắc chắn muốn thêm?`;
    }
  } else {
    return `Bạn có chắc chắn muốn thêm tuyến đường mới?`;
  }
};
