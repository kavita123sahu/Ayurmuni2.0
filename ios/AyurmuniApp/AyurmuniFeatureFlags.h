#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface AyurmuniFeatureFlags : NSObject

/// Must run after `RCTReactNativeFactory` is created and before `startReactNative`.
+ (void)apply;

@end

NS_ASSUME_NONNULL_END
