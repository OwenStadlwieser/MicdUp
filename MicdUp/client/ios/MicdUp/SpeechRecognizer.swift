//
//  SpeechRecognizer.swift
//  MicdUp
//
//  Created by stadlo on 2022-01-28.
//

import Foundation

@objc(SpeechRecognizer)
class SpeechRecognizer : NSObject {
  @objc
   func constantsToExport() -> [AnyHashable : Any]! {
     return ["initialCount": 0]
   }

  @objc static func requiresMainQueueSetup() -> Bool {
      return false
  }
}
