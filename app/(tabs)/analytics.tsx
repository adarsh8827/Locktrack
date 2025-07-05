import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { ChartBar as BarChart3, TrendingUp, Clock, MapPin } from 'lucide-react-native';
import { getAnalytics } from '@/services/firestore';
import { Analytics } from '@/types';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const analyticsData = await getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setLoading(true);
    await loadAnalytics();
    setLoading(false);
  };

  const getChartData = () => {
    if (analytics.length === 0) {
      return {
        trips: { labels: [], datasets: [{ data: [] }] },
        distance: { labels: [], datasets: [{ data: [] }] },
        detention: { labels: [], datasets: [{ data: [] }] },
      };
    }

    const labels = analytics.slice(0, 6).map(a => a.lockNumber);
    
    return {
      trips: {
        labels,
        datasets: [{
          data: analytics.slice(0, 6).map(a => a.totalTrips),
        }],
      },
      distance: {
        labels,
        datasets: [{
          data: analytics.slice(0, 6).map(a => a.totalDistance),
        }],
      },
      detention: {
        labels,
        datasets: [{
          data: analytics.slice(0, 6).map(a => a.totalDetentionTime),
        }],
      },
    };
  };

  const chartData = getChartData();

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    subtitle?: string; 
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Icon size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const getTotalStats = () => {
    return {
      totalTrips: analytics.reduce((sum, a) => sum + a.totalTrips, 0),
      totalDistance: analytics.reduce((sum, a) => sum + a.totalDistance, 0),
      totalDetention: analytics.reduce((sum, a) => sum + a.totalDetentionTime, 0),
      averageTripsPerLock: analytics.length > 0 
        ? (analytics.reduce((sum, a) => sum + a.totalTrips, 0) / analytics.length).toFixed(1)
        : 0,
    };
  };

  const totalStats = getTotalStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <Text style={styles.headerSubtitle}>Lock performance insights</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Trips"
            value={totalStats.totalTrips}
            icon={TrendingUp}
            color="#667eea"
            subtitle="All locks combined"
          />
          <StatCard
            title="Total Distance"
            value={`${totalStats.totalDistance.toFixed(1)} km`}
            icon={MapPin}
            color="#26c6da"
            subtitle="Cumulative distance"
          />
          <StatCard
            title="Total Detention"
            value={`${totalStats.totalDetention} mins`}
            icon={Clock}
            color="#ffa726"
            subtitle="Cumulative time"
          />
          <StatCard
            title="Avg Trips/Lock"
            value={totalStats.averageTripsPerLock}
            icon={BarChart3}
            color="#66bb6a"
            subtitle="Per lock average"
          />
        </View>

        {analytics.length > 0 ? (
          <>
            {/* Trips Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Trips per Lock</Text>
              <BarChart
                data={chartData.trips}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
              />
            </View>

            {/* Distance Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Distance Covered (km)</Text>
              <LineChart
                data={chartData.distance}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(38, 198, 218, ${opacity})`,
                }}
                style={styles.chart}
                bezier
              />
            </View>

            {/* Detention Time Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Detention Time (minutes)</Text>
              <BarChart
                data={chartData.detention}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 167, 38, ${opacity})`,
                }}
                style={styles.chart}
                fromZero
              />
            </View>

            {/* Detailed Analytics Table */}
            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>Detailed Analytics</Text>
              {analytics.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.lockNumber}>{item.lockNumber}</Text>
                  <View style={styles.tableStats}>
                    <Text style={styles.tableStat}>{item.totalTrips} trips</Text>
                    <Text style={styles.tableStat}>{item.totalDistance.toFixed(1)} km</Text>
                    <Text style={styles.tableStat}>{item.totalDetentionTime} mins</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <BarChart3 size={64} color="#adb5bd" />
            <Text style={styles.emptyTitle}>No analytics data</Text>
            <Text style={styles.emptySubtitle}>
              Complete some trips to see analytics
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
  },
  statSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  lockNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  tableStats: {
    flexDirection: 'row',
    gap: 15,
  },
  tableStat: {
    fontSize: 14,
    color: '#6c757d',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});