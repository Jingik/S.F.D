import React, { useState } from 'react';
import {
  View,
  Image,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import axios from 'axios';
import { launchCamera } from 'react-native-image-picker';

export default function CameraScreen() {
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
    try {
      const formData = new FormData();
      formData.append('images', {
        name: image.fileName || 'photo.jpg',
        type: image.type || 'image/jpeg',
        uri: image.uri,
      });

      console.log('Uploading image...', formData); // 로그 출력

      const response = await axios.post(
        'http://192.168.31.56:3001/upload',
        formData,
      );

      if (response.status === 200) {
        const data = response.data;
        setUploadedImageUrl(data.fileUrl);
        console.log('Upload successful', data); // 성공 로그
        Alert.alert('Success', '이미지가 성공적으로 업로드 되었습니다!');
      } else {
        console.log('Upload failed', response.status); // 실패 로그
        Alert.alert('Error', '이미지 업로드를 실패했습니다.');
      }
    } catch (error) {
      console.error('Error uploading image:', error); // 에러 로그
      Alert.alert('Error', '이미지를 업로드하는 도중 에러가 발생했습니다...');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>사진 찍기</Text>
      </TouchableOpacity>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {imageUri && (
          <View style={{ display: 'flex' }}>
            <Text style={{ fontSize: 20 }}>찍은 사진</Text>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
        {uploadedImageUrl && (
          <View style={{ display: 'flex' }}>
            <Text style={{ fontSize: 20 }}>서버로 보낸 사진</Text>
            <Image source={{ uri: uploadedImageUrl }} style={styles.image} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    backgroundColor: 'skyblue',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: '60%',
  },
});
