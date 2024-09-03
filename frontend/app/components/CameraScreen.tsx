import React, { useState } from 'react';
import { View, Button, Image, Alert } from 'react-native';
import { launchCamera } from 'react-native-image-picker';

const CameraScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const takePhoto = () => {
    launchCamera({}, (response) => {
      if (response.assets) {
        setImageUri(response.assets[0].uri);
        uploadImage(response.assets[0]);
      }
    });
  };

  const uploadImage = async (image: any) => {
    const formData = new FormData();
    formData.append('images', {
      name: image.fileName || 'photo.jpg',
      type: image.type || 'image/jpeg',
      uri: image.uri,
    });

    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedImageUrl(data.fileUrl);
        Alert.alert('Success', '이미지가 성공적으로 업로드 되었습니다!');
      } else {
        Alert.alert('Error', '이미지 업로드를 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', '이미지를 업로드하는 도중 에러가 발생했습니다...');
    }
  };

  return (
    <View>
      <Button title="사진 찍기" onPress={takePhoto} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
      )}
      {uploadedImageUrl && (
        <Image
          source={{ uri: uploadedImageUrl }}
          style={{ width: 200, height: 200, marginTop: 20 }}
        />
      )}
    </View>
  );
};

export default CameraScreen;
