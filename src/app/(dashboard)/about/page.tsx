
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">About Us</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">About oxCloud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            oxCloud is developed by Subhajit Roy, Navraj Sikand, Matthew Sample, and Joshua Evans from Petr Šulc's lab at Arizona State University. Our labs have extensive experience in nanostructure design, experiments, and simulation, and also dedicate significant effort to tool and methods development to make the nanostructure design process easier.
          </p>
          <p>
            Any inquiries should be directed to <a href="mailto:oxdna.help@gmail.com" className="text-primary hover:underline">oxdna.help@gmail.com</a>.
          </p>
          <p>
            We gratefully acknowledge NSF grant no. 1931487 which funds the server development.
          </p>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Disclaimer and Copyright</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
                The nanobase.org web application is provided by the copyright holders and contributors "as is" and any express or implied warranties, including, but not limited to, the implied warranties of merchantability and fitness for a particular purpose are disclaimed. In no event shall the copyright holder or contributors be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of the use of the nanobase.org web application, even if advised of the possibility of such damage.
            </p>
            <p>
                Please note that the copyright for the deposited structures is owned by the authors of the publications where the structures were introduced, and we ask you to refer to the respective publications linked in the structure description for further information about patents and copyrights related to the structure.
            </p>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-headline">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            For any requests, queries or suggestion please contact us at <a href="mailto:oxdna.help@gmail.com" className="text-primary hover:underline">oxdna.help@gmail.com</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
