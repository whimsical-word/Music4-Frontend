import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/dio_client.dart';

class AuthRepository {
  final DioClient _dioClient;
  final FlutterSecureStorage _storage;

  AuthRepository(this._dioClient, this._storage);

  Future<bool> login(String username, String password) async {
    try {
      final response = await _dioClient.dio.post(
        '/auth/login',
        data: {
          'username': username,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final accessToken = response.data['accessToken'];
        await _storage.write(key: 'jwt_token', value: accessToken);
        return true;
      }
      return false;
    } on DioException catch (e) {
      if (e.response != null) {
        throw e.response?.data['message'] ?? 'Tài khoản hoặc mật khẩu không chính xác';
      }
      throw 'Lỗi kết nối máy chủ: ${e.message}';
    } catch (e) {
      throw 'Đã xảy ra lỗi: $e';
    }
  }

  Future<String> register({
    required String name,
    required String email,
    required String username,
    required String password,
  }) async {
    try {
      final formData = FormData.fromMap({
        'name': name,
        'email': email,
        'username': username,
        'password': password,
      });

      // Mặc định role trên mobile là listener
      final response = await _dioClient.dio.post(
        '/auth/register?role=listener',
        data: formData,
      );

      if (response.statusCode == 200) {
        return response.data['message'] ?? 'Đăng ký thành công!';
      }
      throw 'Đăng ký không thành công';
    } on DioException catch (e) {
      if (e.response != null) {
        throw e.response?.data['message'] ?? 'Đăng ký không thành công';
      }
      throw 'Lỗi kết nối máy chủ: ${e.message}';
    } catch (e) {
      throw 'Đã xảy ra lỗi: $e';
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
  }

  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'jwt_token');
    return token != null;
  }
}

