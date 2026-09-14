import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  String? _localError;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _handleRegister() async {
    FocusScope.of(context).unfocus();
    setState(() => _localError = null);

    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final username = _usernameController.text.trim();
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (name.isEmpty || email.isEmpty || username.isEmpty || password.isEmpty || confirmPassword.isEmpty) {
      setState(() => _localError = 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      setState(() => _localError = 'Mật khẩu quá ngắn! Phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (password != confirmPassword) {
      setState(() => _localError = 'Mật khẩu xác nhận không khớp!');
      return;
    }

    final success = await ref.read(authProvider.notifier).register(
          name: name,
          email: email,
          username: username,
          password: password,
        );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đăng ký thành công! Đang chuyển hướng...'),
          backgroundColor: Colors.green,
        ),
      );
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) context.pop(); // Quay lại trang đăng nhập
      });
    }
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    String? hintText,
    bool isPassword = false,
    bool obscureText = false,
    VoidCallback? onToggleVisibility,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: Color(0xFFA7A7A7),
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1E1E1E),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: const Color(0xFF282828)),
          ),
          child: TextField(
            controller: controller,
            obscureText: obscureText,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              hintText: hintText,
              hintStyle: const TextStyle(color: Color(0xFF535353)),
              prefixIcon: Icon(icon, color: const Color(0xFFA7A7A7), size: 18),
              suffixIcon: isPassword
                  ? IconButton(
                      icon: Icon(
                        obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: const Color(0xFFA7A7A7),
                        size: 18,
                      ),
                      onPressed: onToggleVisibility,
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final errorMsg = _localError ?? authState.error;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            padding: const EdgeInsets.all(32.0),
            decoration: BoxDecoration(
              color: const Color(0xFF121212),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF282828)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Logo & Header
                Container(
                  width: 56,
                  height: 56,
                  decoration: const BoxDecoration(
                    color: Colors.blue,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.music_note, color: Colors.white, size: 28),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Tạo tài khoản mới',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Tham gia cùng cộng đồng âm nhạc',
                  style: TextStyle(fontSize: 12, color: Color(0xFFA7A7A7)),
                ),
                const SizedBox(height: 32),

                // Error Message
                if (errorMsg != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 24),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.1),
                      border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      errorMsg,
                      style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                      textAlign: TextAlign.center,
                    ),
                  ),

                // Form Fields
                _buildTextField(
                  label: 'Họ và Tên',
                  controller: _nameController,
                  icon: Icons.person_outline,
                  hintText: 'Nguyễn Văn A',
                ),
                const SizedBox(height: 16),
                
                _buildTextField(
                  label: 'Địa chỉ Email',
                  controller: _emailController,
                  icon: Icons.mail_outline,
                  hintText: 'abc@domain.com',
                ),
                const SizedBox(height: 16),

                _buildTextField(
                  label: 'Tên tài khoản',
                  controller: _usernameController,
                  icon: Icons.person_outline,
                  hintText: 'username123',
                ),
                const SizedBox(height: 16),

                _buildTextField(
                  label: 'Mật khẩu',
                  controller: _passwordController,
                  icon: Icons.lock_outline,
                  hintText: 'Tối thiểu 6 ký tự',
                  isPassword: true,
                  obscureText: _obscurePassword,
                  onToggleVisibility: () => setState(() => _obscurePassword = !_obscurePassword),
                ),
                const SizedBox(height: 16),

                _buildTextField(
                  label: 'Xác nhận mật khẩu',
                  controller: _confirmPasswordController,
                  icon: Icons.shield_outlined,
                  hintText: 'Nhập lại mật khẩu ở trên',
                  isPassword: true,
                  obscureText: _obscureConfirmPassword,
                  onToggleVisibility: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                ),
                const SizedBox(height: 28),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: authState.isLoading ? null : _handleRegister,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[600],
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                      elevation: 0,
                    ),
                    child: authState.isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text(
                            'ĐĂNG KÝ TÀI KHOẢN',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1),
                          ),
                  ),
                ),
                const SizedBox(height: 24),
                const Divider(color: Color(0xFF282828)),
                const SizedBox(height: 16),

                // Login Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Đã có tài khoản? ',
                      style: TextStyle(color: Color(0xFFA7A7A7), fontSize: 12),
                    ),
                    GestureDetector(
                      onTap: () => context.pop(), // Pop về màn Login
                      child: const Text(
                        'Đăng nhập ngay',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
