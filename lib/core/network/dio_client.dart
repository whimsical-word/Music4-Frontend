import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class DioClient {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8080/api';
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8080/api';
    }
    return 'http://localhost:8080/api'; // iOS/Desktop
  }

  final Dio dio;
  final FlutterSecureStorage _storage;

  DioClient()
      : dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 10),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        ),
        _storage = const FlutterSecureStorage() {
    _initializeInterceptors();
  }

  void _initializeInterceptors() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Lấy token từ storage và gắn vào header
          final token = await _storage.read(key: 'jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          // Có thể handle refresh token ở đây nếu API trả về 401
          return handler.next(e);
        },
      ),
    );
  }
}

