#import "AyurmuniFeatureFlags.h"

#include <react/featureflags/ReactNativeFeatureFlags.h>
#include <react/featureflags/ReactNativeFeatureFlagsOverridesOSSStable.h>

using namespace facebook::react;

namespace {

// Without these, Reanimated commits revert ScrollView contentOffset in the shadow
// tree, so Pressable/Touchable measure a stale hit rect and drop onPress on device.
// https://github.com/facebook/react-native/issues/49694
class AyurmuniFeatureFlagsOverrides : public ReactNativeFeatureFlagsOverridesOSSStable {
 public:
  bool updateRuntimeShadowNodeReferencesOnCommit() override
  {
    return true;
  }
  bool useShadowNodeStateOnClone() override
  {
    return true;
  }
};

} // namespace

@implementation AyurmuniFeatureFlags

+ (void)apply
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    ReactNativeFeatureFlags::dangerouslyForceOverride(std::make_unique<AyurmuniFeatureFlagsOverrides>());
  });
}

@end
