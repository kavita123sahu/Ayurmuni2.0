package com.payphi.reactnative.sdk

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/**
 * New Architecture–compatible package so `NativeModules.PayphiSdk` is registered
 * under bridgeless / TurboModule interop (RN 0.84 + newArchEnabled).
 */
class PayphiPackage : BaseReactPackage() {
  override fun getModule(
    name: String,
    reactContext: ReactApplicationContext,
  ): NativeModule? {
    return if (name == PayphiModule.NAME) {
      PayphiModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      mapOf(
        PayphiModule.NAME to
          ReactModuleInfo(
            PayphiModule.NAME,
            PayphiModule::class.java.name,
            false, // canOverrideExistingModule
            false, // needsEagerInit
            false, // isCxxModule
            false, // isTurboModule — legacy bridge module via interop
          ),
      )
    }
  }
}
