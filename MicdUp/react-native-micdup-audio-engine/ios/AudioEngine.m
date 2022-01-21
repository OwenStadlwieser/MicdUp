// AudioEngine.m

#import "AudioEngine.h"


@implementation AudioEngine

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(sampleMethod:(NSString *)stringArgument numberParameter:(nonnull NSNumber *)numberArgument callback:(RCTResponseSenderBlock)callback)
{
    // TODO: Implement some actually useful functionality
    callback(@[[NSString stringWithFormat: @"numberArgument: %@ stringArgument: %@", numberArgument, stringArgument]]);
}

RCT_EXPORT_METHOD(applyFilter: (NSString *)filePath numberParameter:(nonnull NSNumber *)reverbSetting numberParameter:(nonnull NSNumber *)pitchChange numberParameter:(nonnull NSNumber *)speedChange callback:(RCTResponseSenderBlock)successCallback callback:(RCTResponseSenderBlock)callback callback:(RCTResponseSenderBlock)errCallback)
{
    let sourceFile: AVAudioFile;
    let format: AVAudioFormat;
    callback(@[filePath]);
    do {
        NSURL *recorderURL = [[NSURL alloc] initFileURLWithPath: filePath];
        sourceFile = AVAudioFile(initWithContentsOfURL: recorderURL)
        format = sourceFile.processingFormat
    } catch {
        errCallback(@["Unable to load the source audio file: \(error.localizedDescription)."])
        fatalError("Unable to load the source audio file: \(error.localizedDescription).")
    }
    let engine = AVAudioEngine()
    let player = AVAudioPlayerNode()
    let reverb = AVAudioUnitReverb()
    let pitch = AVAudioUnitTimePitch()
    let speed = AVAUdioUnitVarisspeed()

    engine.attach(player)
    engine.attach(reverb)
    engine.attach(speed)
    engine.attach(pitch)

    // Set the desired reverb parameters.
    reverb.loadFactoryPreset(.mediumHall)
    reverb.wetDryMix = reverbSetting

    pitch.pitch += pitchChange
    speed.rate += speedChange
    // Connect the nodes.
    engine.connect(player, to: reverb, format: format)
    engine.connect(reverb, to: speed, format: format)
    engine.connect(speed, to: pitch, format: format)
    engine.connect(pitch, to: engine.mainMixerNode, format: format)

    // Schedule the source file.
    player.scheduleFile(sourceFile, at: nil)
    do {
    // The maximum number of frames the engine renders in any single render call.
    let maxFrames: AVAudioFrameCount = 4096
    try engine.enableManualRenderingMode(.offline, format: format,
                                         maximumFrameCount: maxFrames)
    } catch {
        errCallback(@["Enabling manual rendering mode failed: \(error).")])
        fatalError("Enabling manual rendering mode failed: \(error).")
    }

    // The output buffer to which the engine renders the processed data.
    let buffer = AVAudioPCMBuffer(pcmFormat: engine.manualRenderingFormat,
                                frameCapacity: engine.manualRenderingMaximumFrameCount)!

    let outputFile: AVAudioFile
    do {
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let outputURL = documentsURL.appendingPathComponent(filePath)
        outputFile = try AVAudioFile(forWriting: outputURL, settings: sourceFile.fileFormat.settings)
    } catch {
          errCallback(@["Unable to open output audio file: \(error).")])
        fatalError("Unable to open output audio file: \(error).")
    }

    while engine.manualRenderingSampleTime < sourceFile.length {
    do {
        let frameCount = sourceFile.length - engine.manualRenderingSampleTime
        let framesToRender = min(AVAudioFrameCount(frameCount), buffer.frameCapacity)
        
        let status = try engine.renderOffline(framesToRender, to: buffer)
        
        switch status {
            
            case .success:
                // The data rendered successfully. Write it to the output file.
                try outputFile.write(from: buffer)
                
            case .insufficientDataFromInputNode:
                // Applicable only when using the input node as one of the sources.
                break
                
            case .cannotDoInCurrentContext:
                // The engine couldn't render in the current render call.
                // Retry in the next iteration.
                break
                
            case .error:
            fatalError("The manual rendering failed.")
            }
        } catch {
              errCallback(@["The manual rendering failed: \(error).")])
            fatalError("The manual rendering failed: \(error).")
        }
    }

    // Stop the player node and engine.
    player.stop()
    engine.stop()
    successCallback(@[filePath])
}
@end
