import { StyleSheet, Text, View } from 'react-native';

interface Props {
  conectadoApi?: boolean;
}

export function BannerEstadoRed({ conectadoApi = true }: Props) {
  if (conectadoApi) return null;

  return (
    <View style={styles.bannerContainer}>
      <Text style={styles.bannerText}>
        📡 Modo Offline: operando con datos locales sincronizados
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#fff3cd',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffeeba',
    alignItems: 'center',
  },
  bannerText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
  },
});