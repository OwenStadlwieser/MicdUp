//
//  AudioEngineOBJC.m
//  MicdUp
//
//  Created by stadlo on 2022-01-30.
//

#import <Foundation/Foundation.h>
#import "AudioEngineOBJC.h"
#import <React/RCTLog.h>
#import <AVFoundation/AVFoundation.h>
@implementation AudioEngineOBJC

// filter for everything
RCT_EXPORT_METHOD(applyFilter: (nonnull NSString *)name reverbPreset: (nonnull NSNumber*)reverbPreset rever: (nonnull NSNumber*)rever distPreset: (nonnull NSNumber*)distPreset pitchNum: (nonnull NSNumber*)pitchNum dist: (nonnull NSNumber*)dist filter: (nonnull NSNumber*)filter callback:(RCTResponseSenderBlock)callback errCallback:(RCTResponseSenderBlock)errCallback){
  RCTLogInfo(@"In objc implementation file");
  @try {
    AVAudioEngine *audioEngine = [[AVAudioEngine alloc] init];
    AVAudioPlayerNode *player = [[AVAudioPlayerNode alloc] init];
    AVAudioUnitReverb *reverb = [[AVAudioUnitReverb alloc] init];
    AVAudioUnitDistortion *distortion = [[AVAudioUnitDistortion alloc] init];
    AVAudioUnitEQ *eq = [[AVAudioUnitEQ alloc] initWithNumberOfBands:1];
    AVAudioUnitTimePitch *pitch = [[AVAudioUnitTimePitch alloc] init];
    RCTLogInfo(@"Intiated");
    [audioEngine attachNode:player];
    [audioEngine attachNode:reverb];
    [audioEngine attachNode:distortion];
    [audioEngine attachNode:eq];
    [audioEngine attachNode:pitch];
    RCTLogInfo(@"Attached");
    NSURL *soundUrl = [NSURL URLWithString:name];
    RCTLogInfo(@"%@", name);
    RCTLogInfo(@"%@", soundUrl.path);
    NSError* myErr = nil;
    AVAudioFile *file=[[AVAudioFile alloc] initForReading:soundUrl error:&myErr];
    if(myErr) { errCallback(@[myErr.description]); }

    RCTLogInfo(@"%@", file.description);
    RCTLogInfo(@"file allocated");
    AVAudioFormat *format=file.processingFormat;
    RCTLogInfo(@"file format confirmed");
    AVAudioFrameCount capacity= (AVAudioFrameCount)file.length;
    RCTLogInfo(@"capacity allocated");
    [reverb loadFactoryPreset:(AVAudioUnitReverbPreset)reverbPreset];
    RCTLogInfo(@"reverb loaded");
    [reverb setWetDryMix:[rever floatValue]];
    RCTLogInfo(@"reverb set");
    [distortion loadFactoryPreset:(AVAudioUnitDistortionPreset)distPreset];
    [distortion setWetDryMix:[dist floatValue]];
    
    eq.bands[0].filterType = (AVAudioUnitEQFilterType) filter;
    pitch.pitch = [pitchNum floatValue];
    [audioEngine connect:player to:reverb format:format];
    [audioEngine connect:reverb to:pitch format:format];
    [audioEngine connect:pitch to:distortion format:format];
    [audioEngine connect:distortion to:eq format:format];
    [audioEngine connect:eq to:audioEngine.mainMixerNode format:format];
    RCTLogInfo(@"all connected");
    [player scheduleFile:file atTime:nil completionHandler:nil];
    RCTLogInfo(@"file scheduled");
    [audioEngine enableManualRenderingMode:AVAudioEngineManualRenderingModeOffline format:format maximumFrameCount:4096 error:nil];
    RCTLogInfo(@"engine enabled");
    [audioEngine startAndReturnError:nil];
    RCTLogInfo(@"engine started");
    [player play];
    RCTLogInfo(@"Playing");
    AVAudioPCMBuffer *buffer=[[AVAudioPCMBuffer alloc] initWithPCMFormat:audioEngine.manualRenderingFormat frameCapacity:audioEngine.manualRenderingMaximumFrameCount];
    RCTLogInfo(@"buffer intiated");
    [file readIntoBuffer:buffer error:nil];
    RCTLogInfo(@"read intiated");
    [player scheduleBuffer:buffer completionHandler:nil];
    CFUUIDRef uuidRef = CFUUIDCreate(NULL);
    CFStringRef uuidStringRef = CFUUIDCreateString(NULL, uuidRef);
    CFRelease(uuidRef);
    NSString* myStr = (__bridge_transfer  NSString *)uuidStringRef;
    NSURL* outputUrl = [NSFileManager.defaultManager URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask][0];
    NSString* intermideate = [myStr stringByAppendingString:@"."];
    NSString* finalFileName = [intermideate stringByAppendingString:soundUrl.pathExtension];
    NSURL* appendOutputUrl = [outputUrl URLByAppendingPathComponent:finalFileName];
    AVAudioFile *writeFile=[[AVAudioFile alloc] initForWriting:appendOutputUrl settings:file.fileFormat.settings error:&myErr];
    
    while (audioEngine.manualRenderingSampleTime < file.length) {
      AVAudioFramePosition point =  file.length - audioEngine.manualRenderingSampleTime;
      AVAudioFrameCount count = MIN(point, buffer.frameCapacity);
      AVAudioEngineManualRenderingStatus stat = [audioEngine renderOffline:count toBuffer:buffer error:&myErr];
      if(myErr) {
        [player stop];
        [audioEngine stop];
        errCallback(@[myErr.description]);
        
      }

      switch (stat) {
        case AVAudioEngineManualRenderingStatusSuccess:
          [writeFile writeFromBuffer:buffer error:&myErr];
          if(myErr) {
            [player stop];
            [audioEngine stop];
            errCallback(@[myErr.description]);
            
          }
          break;
        case AVAudioEngineManualRenderingStatusError:
          errCallback(@[@"ERROR"]);
        default:
          break;
      }
    }
    [player stop];
    [audioEngine stop];
    callback(@[appendOutputUrl.absoluteString]);
    RCTLogInfo(@"success");
  } @catch (NSException* e){
    RCTLogInfo(@"errror");
    errCallback(@[e.reason]);
  } @finally {
  }
}

// filter for pitch
RCT_EXPORT_METHOD(applyPitchFilter:  (nonnull NSString *)name  pitchNum: (nonnull NSNumber*)pitchNum callback:(RCTResponseSenderBlock)callback errCallback:(RCTResponseSenderBlock)errCallback){
  RCTLogInfo(@"In objc implementation file");
  @try {
    AVAudioEngine *audioEngine = [[AVAudioEngine alloc] init];
    AVAudioPlayerNode *player = [[AVAudioPlayerNode alloc] init];
    AVAudioUnitTimePitch *pitch = [[AVAudioUnitTimePitch alloc] init];
    RCTLogInfo(@"Intiated");
    [audioEngine attachNode:player];
    [audioEngine attachNode:pitch];
    RCTLogInfo(@"Attached");
    NSURL *soundUrl = [NSURL URLWithString:name];
    RCTLogInfo(@"%@", name);
    RCTLogInfo(@"%@", soundUrl.path);
    NSError* myErr = nil;
    AVAudioFile *file=[[AVAudioFile alloc] initForReading:soundUrl error:&myErr];
    if(myErr) { errCallback(@[myErr.description]); }

    RCTLogInfo(@"%@", file.description);
    RCTLogInfo(@"file allocated");
    AVAudioFormat *format=file.processingFormat;
    RCTLogInfo(@"file format confirmed");
    AVAudioFrameCount capacity= (AVAudioFrameCount)file.length;
    pitch.pitch = [pitchNum floatValue];

    [audioEngine connect:player to:pitch format:format];
    [audioEngine connect:pitch to:audioEngine.mainMixerNode format:format];
    RCTLogInfo(@"all connected");
    [player scheduleFile:file atTime:nil completionHandler:nil];
    RCTLogInfo(@"file scheduled");
    [audioEngine enableManualRenderingMode:AVAudioEngineManualRenderingModeOffline format:format maximumFrameCount:4096 error:nil];
    RCTLogInfo(@"engine enabled");
    [audioEngine startAndReturnError:nil];
    RCTLogInfo(@"engine started");
    [player play];
    RCTLogInfo(@"Playing");
    AVAudioPCMBuffer *buffer=[[AVAudioPCMBuffer alloc] initWithPCMFormat:audioEngine.manualRenderingFormat frameCapacity:audioEngine.manualRenderingMaximumFrameCount];
    RCTLogInfo(@"buffer intiated");
    [file readIntoBuffer:buffer error:nil];
    RCTLogInfo(@"read intiated");
    [player scheduleBuffer:buffer completionHandler:nil];
    CFUUIDRef uuidRef = CFUUIDCreate(NULL);
    CFStringRef uuidStringRef = CFUUIDCreateString(NULL, uuidRef);
    CFRelease(uuidRef);
    NSString* myStr = (__bridge_transfer  NSString *)uuidStringRef;
    NSURL* outputUrl = [NSFileManager.defaultManager URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask][0];
    NSString* intermideate = [myStr stringByAppendingString:@"."];
    NSString* finalFileName = [intermideate stringByAppendingString:soundUrl.pathExtension];
    NSURL* appendOutputUrl = [outputUrl URLByAppendingPathComponent:finalFileName];
    AVAudioFile *writeFile=[[AVAudioFile alloc] initForWriting:appendOutputUrl settings:file.fileFormat.settings error:&myErr];
    
    while (audioEngine.manualRenderingSampleTime < file.length) {
      AVAudioFramePosition point =  file.length - audioEngine.manualRenderingSampleTime;
      AVAudioFrameCount count = MIN(point, buffer.frameCapacity);
      AVAudioEngineManualRenderingStatus stat = [audioEngine renderOffline:count toBuffer:buffer error:&myErr];
      if(myErr) {
        [player stop];
        [audioEngine stop];
        errCallback(@[myErr.description]);
        
      }

      switch (stat) {
        case AVAudioEngineManualRenderingStatusSuccess:
          [writeFile writeFromBuffer:buffer error:&myErr];
          if(myErr) {
            [player stop];
            [audioEngine stop];
            errCallback(@[myErr.description]);
            
          }
          break;
        case AVAudioEngineManualRenderingStatusError:
          errCallback(@[@"ERROR"]);
        default:
          break;
      }
    }
    [player stop];
    [audioEngine stop];
    callback(@[appendOutputUrl.absoluteString]);
    RCTLogInfo(@"success");
  } @catch (NSException* e){
    RCTLogInfo(@"errror");
    errCallback(@[e.reason]);
  } @finally {
  }
}
// filter for equalizer

RCT_EXPORT_METHOD(applyEqualizerFilter:  (nonnull NSString *)name filter: (nonnull NSNumber*)filter callback:(RCTResponseSenderBlock)callback errCallback:(RCTResponseSenderBlock)errCallback){
  RCTLogInfo(@"In objc implementation file");
  @try {
    AVAudioEngine *audioEngine = [[AVAudioEngine alloc] init];
    AVAudioPlayerNode *player = [[AVAudioPlayerNode alloc] init];
    AVAudioUnitEQ *eq = [[AVAudioUnitEQ alloc] initWithNumberOfBands:1];
    RCTLogInfo(@"Intiated");
    [audioEngine attachNode:player];
    [audioEngine attachNode:eq];
    RCTLogInfo(@"Attached");
    NSURL *soundUrl = [NSURL URLWithString:name];
    RCTLogInfo(@"%@", name);
    RCTLogInfo(@"%@", soundUrl.path);
    NSError* myErr = nil;
    AVAudioFile *file=[[AVAudioFile alloc] initForReading:soundUrl error:&myErr];
    if(myErr) { errCallback(@[myErr.description]); }

    RCTLogInfo(@"%@", file.description);
    RCTLogInfo(@"file allocated");
    AVAudioFormat *format=file.processingFormat;
    RCTLogInfo(@"file format confirmed");
    AVAudioFrameCount capacity= (AVAudioFrameCount)file.length;
    eq.bands[0].filterType = (AVAudioUnitEQFilterType) filter;

    [audioEngine connect:player to:eq format:format];
    [audioEngine connect:eq to:audioEngine.mainMixerNode format:format];
    RCTLogInfo(@"all connected");
    [player scheduleFile:file atTime:nil completionHandler:nil];
    RCTLogInfo(@"file scheduled");
    [audioEngine enableManualRenderingMode:AVAudioEngineManualRenderingModeOffline format:format maximumFrameCount:4096 error:nil];
    RCTLogInfo(@"engine enabled");
    [audioEngine startAndReturnError:nil];
    RCTLogInfo(@"engine started");
    [player play];
    RCTLogInfo(@"Playing");
    AVAudioPCMBuffer *buffer=[[AVAudioPCMBuffer alloc] initWithPCMFormat:audioEngine.manualRenderingFormat frameCapacity:audioEngine.manualRenderingMaximumFrameCount];
    RCTLogInfo(@"buffer intiated");
    [file readIntoBuffer:buffer error:nil];
    RCTLogInfo(@"read intiated");
    [player scheduleBuffer:buffer completionHandler:nil];
    CFUUIDRef uuidRef = CFUUIDCreate(NULL);
    CFStringRef uuidStringRef = CFUUIDCreateString(NULL, uuidRef);
    CFRelease(uuidRef);
    NSString* myStr = (__bridge_transfer  NSString *)uuidStringRef;
    NSURL* outputUrl = [NSFileManager.defaultManager URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask][0];
    NSString* intermideate = [myStr stringByAppendingString:@"."];
    NSString* finalFileName = [intermideate stringByAppendingString:soundUrl.pathExtension];
    NSURL* appendOutputUrl = [outputUrl URLByAppendingPathComponent:finalFileName];
    AVAudioFile *writeFile=[[AVAudioFile alloc] initForWriting:appendOutputUrl settings:file.fileFormat.settings error:&myErr];
    
    while (audioEngine.manualRenderingSampleTime < file.length) {
      AVAudioFramePosition point =  file.length - audioEngine.manualRenderingSampleTime;
      AVAudioFrameCount count = MIN(point, buffer.frameCapacity);
      AVAudioEngineManualRenderingStatus stat = [audioEngine renderOffline:count toBuffer:buffer error:&myErr];
      if(myErr) {
        [player stop];
        [audioEngine stop];
        errCallback(@[myErr.description]);
        
      }

      switch (stat) {
        case AVAudioEngineManualRenderingStatusSuccess:
          [writeFile writeFromBuffer:buffer error:&myErr];
          if(myErr) {
            [player stop];
            [audioEngine stop];
            errCallback(@[myErr.description]);
            
          }
          break;
        case AVAudioEngineManualRenderingStatusError:
          errCallback(@[@"ERROR"]);
        default:
          break;
      }
    }
    [player stop];
    [audioEngine stop];
    callback(@[appendOutputUrl.absoluteString]);
    RCTLogInfo(@"success");
  } @catch (NSException* e){
    RCTLogInfo(@"errror");
    errCallback(@[e.reason]);
  } @finally {
  }
}
// filter for distortion
RCT_EXPORT_METHOD(applyDistortionFilter: (nonnull NSString *)name distPreset: (nonnull NSNumber*)distPreset dist: (nonnull NSNumber*)dist callback:(RCTResponseSenderBlock)callback errCallback:(RCTResponseSenderBlock)errCallback){
  RCTLogInfo(@"In objc implementation file");
  @try {
    AVAudioEngine *audioEngine = [[AVAudioEngine alloc] init];
    AVAudioPlayerNode *player = [[AVAudioPlayerNode alloc] init];
    AVAudioUnitDistortion *distortion = [[AVAudioUnitDistortion alloc] init];
    RCTLogInfo(@"Intiated");
    [audioEngine attachNode:player];
    [audioEngine attachNode:distortion];
    RCTLogInfo(@"Attached");
    NSURL *soundUrl = [NSURL URLWithString:name];
    RCTLogInfo(@"%@", name);
    RCTLogInfo(@"%@", soundUrl.path);
    NSError* myErr = nil;
    AVAudioFile *file=[[AVAudioFile alloc] initForReading:soundUrl error:&myErr];
    if(myErr) { errCallback(@[myErr.description]); }

    RCTLogInfo(@"%@", file.description);
    RCTLogInfo(@"file allocated");
    AVAudioFormat *format=file.processingFormat;
    RCTLogInfo(@"file format confirmed");
    AVAudioFrameCount capacity= (AVAudioFrameCount)file.length;
    [distortion loadFactoryPreset:(AVAudioUnitDistortionPreset)distPreset];
    [distortion setWetDryMix:[dist floatValue]];
  
    [audioEngine connect:player to:distortion format:format];
    [audioEngine connect:distortion to:audioEngine.mainMixerNode format:format];
    RCTLogInfo(@"all connected");
    [player scheduleFile:file atTime:nil completionHandler:nil];
    RCTLogInfo(@"file scheduled");
    [audioEngine enableManualRenderingMode:AVAudioEngineManualRenderingModeOffline format:format maximumFrameCount:4096 error:nil];
    RCTLogInfo(@"engine enabled");
    [audioEngine startAndReturnError:nil];
    RCTLogInfo(@"engine started");
    [player play];
    RCTLogInfo(@"Playing");
    AVAudioPCMBuffer *buffer=[[AVAudioPCMBuffer alloc] initWithPCMFormat:audioEngine.manualRenderingFormat frameCapacity:audioEngine.manualRenderingMaximumFrameCount];
    RCTLogInfo(@"buffer intiated");
    [file readIntoBuffer:buffer error:nil];
    RCTLogInfo(@"read intiated");
    [player scheduleBuffer:buffer completionHandler:nil];
    CFUUIDRef uuidRef = CFUUIDCreate(NULL);
    CFStringRef uuidStringRef = CFUUIDCreateString(NULL, uuidRef);
    CFRelease(uuidRef);
    NSString* myStr = (__bridge_transfer  NSString *)uuidStringRef;
    NSURL* outputUrl = [NSFileManager.defaultManager URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask][0];
    NSString* intermideate = [myStr stringByAppendingString:@"."];
    NSString* finalFileName = [intermideate stringByAppendingString:soundUrl.pathExtension];
    NSURL* appendOutputUrl = [outputUrl URLByAppendingPathComponent:finalFileName];
    AVAudioFile *writeFile=[[AVAudioFile alloc] initForWriting:appendOutputUrl settings:file.fileFormat.settings error:&myErr];
    
    while (audioEngine.manualRenderingSampleTime < file.length) {
      AVAudioFramePosition point =  file.length - audioEngine.manualRenderingSampleTime;
      AVAudioFrameCount count = MIN(point, buffer.frameCapacity);
      AVAudioEngineManualRenderingStatus stat = [audioEngine renderOffline:count toBuffer:buffer error:&myErr];
      if(myErr) {
        [player stop];
        [audioEngine stop];
        errCallback(@[myErr.description]);
        
      }

      switch (stat) {
        case AVAudioEngineManualRenderingStatusSuccess:
          [writeFile writeFromBuffer:buffer error:&myErr];
          if(myErr) {
            [player stop];
            [audioEngine stop];
            errCallback(@[myErr.description]);
            
          }
          break;
        case AVAudioEngineManualRenderingStatusError:
          errCallback(@[@"ERROR"]);
        default:
          break;
      }
    }
    [player stop];
    [audioEngine stop];
    callback(@[appendOutputUrl.absoluteString]);
    RCTLogInfo(@"success");
  } @catch (NSException* e){
    RCTLogInfo(@"errror");
    errCallback(@[e.reason]);
  } @finally {
  }
}

// filter for reverb
RCT_EXPORT_METHOD(applyReverbFilter: (nonnull NSString *)name reverbPreset: (nonnull NSNumber*)reverbPreset rever: (nonnull NSNumber*)rever callback:(RCTResponseSenderBlock)callback errCallback:(RCTResponseSenderBlock)errCallback){
  RCTLogInfo(@"In objc implementation file");
  @try {
    AVAudioEngine *audioEngine = [[AVAudioEngine alloc] init];
    AVAudioPlayerNode *player = [[AVAudioPlayerNode alloc] init];
    AVAudioUnitReverb *reverb = [[AVAudioUnitReverb alloc] init];
    RCTLogInfo(@"Intiated");
    [audioEngine attachNode:player];
    [audioEngine attachNode:reverb];
    RCTLogInfo(@"Attached");
    NSURL *soundUrl = [NSURL URLWithString:name];
    RCTLogInfo(@"%@", name);
    RCTLogInfo(@"%@", soundUrl.path);
    NSError* myErr = nil;
    AVAudioFile *file=[[AVAudioFile alloc] initForReading:soundUrl error:&myErr];
    if(myErr) { errCallback(@[myErr.description]); }

    RCTLogInfo(@"%@", file.description);
    RCTLogInfo(@"file allocated");
    AVAudioFormat *format=file.processingFormat;
    RCTLogInfo(@"file format confirmed");
    AVAudioFrameCount capacity= (AVAudioFrameCount)file.length;
    RCTLogInfo(@"capacity allocated");
    [reverb loadFactoryPreset:(AVAudioUnitReverbPreset)reverbPreset];
    RCTLogInfo(@"reverb loaded");
    [reverb setWetDryMix:[rever floatValue]];
    RCTLogInfo(@"reverb set");
    [audioEngine connect:player to:reverb format:format];
    [audioEngine connect:reverb to:audioEngine.mainMixerNode format:format];
    // FIXME: Modularize everything below
    RCTLogInfo(@"all connected");
    [player scheduleFile:file atTime:nil completionHandler:nil];
    RCTLogInfo(@"file scheduled");
    [audioEngine enableManualRenderingMode:AVAudioEngineManualRenderingModeOffline format:format maximumFrameCount:4096 error:nil];
    RCTLogInfo(@"engine enabled");
    [audioEngine startAndReturnError:nil];
    RCTLogInfo(@"engine started");
    [player play];
    RCTLogInfo(@"Playing");
    AVAudioPCMBuffer *buffer=[[AVAudioPCMBuffer alloc] initWithPCMFormat:audioEngine.manualRenderingFormat frameCapacity:audioEngine.manualRenderingMaximumFrameCount];
    RCTLogInfo(@"buffer intiated");
    [file readIntoBuffer:buffer error:nil];
    RCTLogInfo(@"read intiated");
    [player scheduleBuffer:buffer completionHandler:nil];
    CFUUIDRef uuidRef = CFUUIDCreate(NULL);
    CFStringRef uuidStringRef = CFUUIDCreateString(NULL, uuidRef);
    CFRelease(uuidRef);
    NSString* myStr = (__bridge_transfer  NSString *)uuidStringRef;
    NSURL* outputUrl = [NSFileManager.defaultManager URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask][0];
    NSString* intermideate = [myStr stringByAppendingString:@"."];
    NSString* finalFileName = [intermideate stringByAppendingString:soundUrl.pathExtension];
    NSURL* appendOutputUrl = [outputUrl URLByAppendingPathComponent:finalFileName];
    AVAudioFile *writeFile=[[AVAudioFile alloc] initForWriting:appendOutputUrl settings:file.fileFormat.settings error:&myErr];
    
    while (audioEngine.manualRenderingSampleTime < file.length) {
      AVAudioFramePosition point =  file.length - audioEngine.manualRenderingSampleTime;
      AVAudioFrameCount count = MIN(point, buffer.frameCapacity);
      AVAudioEngineManualRenderingStatus stat = [audioEngine renderOffline:count toBuffer:buffer error:&myErr];
      if(myErr) {
        [player stop];
        [audioEngine stop];
        errCallback(@[myErr.description]);
        
      }

      switch (stat) {
        case AVAudioEngineManualRenderingStatusSuccess:
          [writeFile writeFromBuffer:buffer error:&myErr];
          if(myErr) {
            [player stop];
            [audioEngine stop];
            errCallback(@[myErr.description]);
            
          }
          break;
        case AVAudioEngineManualRenderingStatusError:
          errCallback(@[@"ERROR"]);
        default:
          break;
      }
    }
    [player stop];
    [audioEngine stop];
    callback(@[appendOutputUrl.absoluteString]);
    RCTLogInfo(@"success");
  } @catch (NSException* e){
    RCTLogInfo(@"errror");
    errCallback(@[e.reason]);
  } @finally {
  }
}

RCT_EXPORT_MODULE()

@end
