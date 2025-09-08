import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import {
  CameraView,
  CameraCapturedPicture,
  CameraType,
  useCameraPermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<
    boolean | null
  >(null);
  const [image, setImage] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const cameraRef = useRef<React.ComponentRef<typeof CameraView>>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    };

    requestPermissions();
  }, []);

  if (!cameraPermission || hasMediaLibraryPermission === null) {
    return <View />; // แสดงหน้าจอว่างเปล่าระหว่างรอการตอบกลับ permission
  }
  if (!cameraPermission.granted || hasMediaLibraryPermission === false) {
    return <Text>กรุณาอนุญาตให้แอปเข้าถึงกล้องและคลังรูปภาพ</Text>;
  }

  const saveImage = async () => {
    if (image) {
      try {
        await MediaLibrary.createAssetAsync(image);
        alert("บันทึกรูปภาพเรียบร้อย!");
        setImage(null); // กลับไปหน้ากล้อง
      } catch (e) {
        console.log(e);
      }
    }
  };

  // ฟังก์ชันสำหรับถ่ายภาพ
  const takePicture = async (): Promise<void> => {
    if (cameraRef.current) {
      try {
        const options = { quality: 1, base64: true, exif: false };
        const newPhoto: CameraCapturedPicture =
          await cameraRef.current.takePictureAsync(options);
        setImage(newPhoto.uri);
      } catch (error) {
        console.log("Error taking picture:", error);
      }
    }
  };

  // ฟังก์ชันสำหรับถ่ายใหม่
  const retakePicture = () => {
    setImage(null);
  };

  // ถ้ายังไม่มีรูปภาพที่ถ่าย ให้แสดงหน้าจอกล้อง
  if (!image) {
    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing={cameraType} />
        <View style={styles.buttonTakePicture}>
          <Button title="ถ่ายรูป" onPress={takePicture} />
        </View>
      </View>
    );
  }

  // ถ้ามีรูปแล้ว ให้แสดงรูปภาพและปุ่มสำหรับบันทึกหรือถ่ายใหม่
  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.previewImage} />
      <View style={styles.buttonContainer}>
        {hasMediaLibraryPermission ? (
          <Button title="บันทึก" onPress={saveImage} />
        ) : undefined}
        <Button title="ถ่ายใหม่" onPress={() => setImage(null)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  buttonTakePicture: {
    padding: 20,
  },
  buttonContainer: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  previewImage: {
    flex: 1,
    width: "100%",
    resizeMode: "contain",
  },
});
