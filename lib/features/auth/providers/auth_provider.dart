import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../../../core/network/dio_client.dart';
import '../data/auth_repository.dart';

// Provides standard DioClient
final dioClientProvider = Provider((ref) => DioClient());

// Provides secure storage
final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

// Provides AuthRepository
final authRepositoryProvider = Provider((ref) {
  final dioClient = ref.watch(dioClientProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthRepository(dioClient, storage);
});

// Trạng thái của Auth
class AuthState {
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;
  final String? name; // Thêm name để hiển thị ở Trang chủ

  AuthState({this.isLoading = false, this.error, this.isAuthenticated = false, this.name});

  AuthState copyWith({bool? isLoading, String? error, bool? isAuthenticated, String? name}) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error, // Cho phép set lại null
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      name: name ?? this.name,
    );
  }
}

// Auth Notifier
class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    Future.microtask(() => checkAuthStatus());
    return AuthState();
  }

  AuthRepository get _repository => ref.read(authRepositoryProvider);
  FlutterSecureStorage get _storage => ref.read(secureStorageProvider);

  String? _decodeNameFromToken(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
      final data = jsonDecode(payload);
      return data['name']?.toString();
    } catch (e) {
      return null;
    }
  }

  Future<void> checkAuthStatus() async {
    final isAuth = await _repository.isLoggedIn();
    String? userName;
    if (isAuth) {
      final token = await _storage.read(key: 'jwt_token');
      if (token != null) userName = _decodeNameFromToken(token);
    }
    state = state.copyWith(isAuthenticated: isAuth, name: userName);
  }

  Future<bool> login(String username, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final success = await _repository.login(username, password);
      String? userName;
      if (success) {
        final token = await _storage.read(key: 'jwt_token');
        if (token != null) userName = _decodeNameFromToken(token);
      }
      state = state.copyWith(isLoading: false, isAuthenticated: success, name: userName);
      return success;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String username,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repository.register(
        name: name,
        email: email,
        username: username,
        password: password,
      );
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = state.copyWith(isAuthenticated: false, name: null);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
