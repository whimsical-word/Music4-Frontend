import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

void main() {
  runApp(
    // Bọc toàn bộ app với ProviderScope để sử dụng Riverpod
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final goRouter = ref.watch(goRouterProvider);

    return MaterialApp.router(
      title: 'Music4 Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: goRouter,
    );
  }
}

