declare module 'phoenix' {
  export class Push {
    receive(status: string, callback: (resp?: any) => void): this
  }

  export class Channel {
    state: 'closed' | 'errored' | 'joined' | 'joining' | 'leaving'
    join(timeout?: number): Push
    leave(timeout?: number): Push
    push(event: string, payload: object, timeout?: number): Push
    on(event: string, callback: (response?: any) => void): number
    off(event: string, ref?: number): void
  }

  export class Socket {
    constructor(endPoint: string, opts?: { params?: object | (() => object) })
    connect(): void
    disconnect(callback?: () => void, code?: number, reason?: string): void
    onOpen(callback: () => void): void
    onClose(callback: (event?: any) => void): void
    onError(callback: (error?: any) => void): void
    channel(topic: string, chanParams?: object): Channel
  }
}

declare module 'expo-location' {
  export enum Accuracy {
    Lowest = 1,
    Low = 2,
    Balanced = 3,
    High = 4,
    Highest = 5,
    BestForNavigation = 6,
  }

  export interface LocationObjectCoords {
    latitude: number
    longitude: number
    altitude: number | null
    accuracy: number | null
    altitudeAccuracy: number | null
    heading: number | null
    speed: number | null
  }

  export interface LocationObject {
    coords: LocationObjectCoords
    timestamp: number
  }

  export interface LocationSubscription {
    remove(): void
  }

  export function requestForegroundPermissionsAsync(): Promise<{ status: string; granted: boolean }>
  export function requestBackgroundPermissionsAsync(): Promise<{ status: string; granted: boolean }>
  export function watchPositionAsync(
    options: {
      accuracy?: Accuracy
      timeInterval?: number
      distanceInterval?: number
    },
    callback: (location: LocationObject) => void
  ): Promise<LocationSubscription>
  export function startLocationUpdatesAsync(
    taskName: string,
    options?: {
      accuracy?: Accuracy
      timeInterval?: number
      distanceInterval?: number
      showsBackgroundLocationIndicator?: boolean
      foregroundService?: {
        notificationTitle: string
        notificationBody: string
        notificationColor?: string
      }
    }
  ): Promise<void>
  export function hasStartedLocationUpdatesAsync(taskName: string): Promise<boolean>
  export function stopLocationUpdatesAsync(taskName: string): Promise<void>
}

declare module 'expo-task-manager' {
  export interface TaskManagerError {
    code: string | number
    message: string
  }

  export interface TaskManagerTaskBody<T = any> {
    data: T
    error: TaskManagerError | null
    executionInfo: {
      eventId: string
      taskName: string
    }
  }

  export function isTaskDefined(taskName: string): boolean
  export function defineTask<T = any>(
    taskName: string,
    taskExecutor: (body: TaskManagerTaskBody<T>) => Promise<any> | void
  ): void
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.css' {}

