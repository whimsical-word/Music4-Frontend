import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/search_repository.dart';

final searchRepositoryProvider = Provider<SearchRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return SearchRepository(dioClient);
});

final searchProvider = AsyncNotifierProvider<SearchNotifier, SearchResult>(() {
  return SearchNotifier();
});

class SearchNotifier extends AsyncNotifier<SearchResult> {
  Timer? _debounceTimer;

  @override
  FutureOr<SearchResult> build() {
    return SearchResult(); // Kết quả rỗng ban đầu
  }

  void search(String query) {
    if (query.trim().isEmpty) {
      state = AsyncData(SearchResult());
      return;
    }

    state = const AsyncLoading();
    
    // Debounce: Chờ 500ms sau khi người dùng ngừng gõ mới gọi API
    if (_debounceTimer?.isActive ?? false) _debounceTimer!.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () async {
      try {
        final result = await ref.read(searchRepositoryProvider).search(query);
        state = AsyncData(result);
      } catch (e, stack) {
        state = AsyncError(e, stack);
      }
    });
  }
}

